"use client";

import { useRef, useState, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/client";
import { calcRR } from "@/lib/utils";
import { BROKERS, type BrokerConfig, type FieldMapping } from "@/lib/brokers";
import type { Profile } from "@/types";
import { useLanguage } from "@/lib/i18n";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedTrade {
  asset: string | null;
  direction: "LONG" | "SHORT" | null;
  entry: number | null;
  sl: number | null;
  tp: number | null;
  rr: number | null;
  lot_size: number | null;
  pnl: number | null;
  result: "win" | "loss" | "be" | null;
  created_at: string;
  _valid: boolean;
  _overLimit: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: (count: number) => void;
  profile: Profile | null;
  currentTradeCount: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_LIMIT = 3;
const CATEGORIES: { key: BrokerConfig["category"]; labelKey: keyof ReturnType<typeof useLanguage>["t"]["journal"] }[] = [
  { key: "forex", labelKey: "importCategoryForex" },
  { key: "crypto", labelKey: "importCategoryCrypto" },
  { key: "stock", labelKey: "importCategoryStock" },
  { key: "paper", labelKey: "importCategoryPaper" },
];

// ─── Parsing helpers ─────────────────────────────────────────────────────────

function buildHeaderIndex(headers: string[]): Record<string, string> {
  const idx: Record<string, string> = {};
  for (const h of headers) {
    idx[h.trim().toLowerCase()] = h;
  }
  return idx;
}

function resolveAlias(
  row: Record<string, string>,
  idx: Record<string, string>,
  mapping: FieldMapping
): string | null {
  for (const alias of mapping.aliases) {
    const key = idx[alias.trim().toLowerCase()];
    if (key !== undefined && row[key] !== undefined && row[key] !== "") {
      return row[key];
    }
  }
  return null;
}

function parseMT4Date(raw: string): string {
  // Format: "2024.01.15 09:30" or "2024.01.15 09:30:00"
  const cleaned = raw.trim().replace(/\./g, "-");
  const d = new Date(cleaned);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function parseDate(raw: string | null, fmt: BrokerConfig["dateFormat"]): string {
  if (!raw || raw.trim() === "") return new Date().toISOString();
  if (fmt === "mt4") return parseMT4Date(raw);
  if (fmt === "unix_ms") {
    const n = parseInt(raw, 10);
    return isNaN(n) ? new Date().toISOString() : new Date(n).toISOString();
  }
  // iso
  const d = new Date(raw.trim());
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function deriveResult(pnl: number | null): "win" | "loss" | "be" | null {
  if (pnl === null) return null;
  if (pnl > 0) return "win";
  if (pnl < 0) return "loss";
  return "be";
}

// ─── File parsers ─────────────────────────────────────────────────────────────

/**
 * Keywords that appear in trade history header rows across all brokers.
 * Used to find the real header row when files have metadata rows at the top.
 */
const HEADER_KW = /^(#|deal|order|ticket|time|open[\s_]?time|close[\s_]?time|type|direction|side|size|volume|lots|item|symbol|pair|instrument|price|open[\s_]?price|close[\s_]?price|s\s*\/\s*l|stop[\s_]?loss|t\s*\/\s*p|take[\s_]?profit|profit|commission|swap|net|pnl|p&l|date|balance|action|qty|quantity|amount|fee)$/i;

/**
 * Given raw rows (arrays of strings), find the header row by scoring each
 * of the first 15 rows. The row whose cells best match known trade column
 * keywords becomes the header. All rows after it become data objects.
 * This handles MT4/MT5/broker files that have metadata rows before headers.
 */
function smartHeaderRows(rawRows: string[][]): Record<string, string>[] {
  if (rawRows.length < 2) return [];

  // Score each candidate row
  let headerIdx = 0;
  let bestScore = 0;
  for (let i = 0; i < Math.min(15, rawRows.length); i++) {
    const score = rawRows[i].filter(c => HEADER_KW.test(c.trim())).length;
    if (score > bestScore) { bestScore = score; headerIdx = i; }
  }

  // Build unique header names (MT4 has two "Time" and two "Price" columns)
  const seen: Record<string, number> = {};
  const headers = rawRows[headerIdx].map((h, i) => {
    const key = h.trim() || `__COL_${i}`;
    if (seen[key] !== undefined) { seen[key]++; return `${key}_${seen[key]}`; }
    seen[key] = 0;
    return key;
  });

  // Convert remaining rows to objects, stopping at section boundaries.
  // MT5 CSV has multiple sections (Positions / Orders / Deals) separated by
  // label rows and new headers — we only want the FIRST section.
  const result: Record<string, string>[] = [];
  for (let i = headerIdx + 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row.some(c => c.trim())) continue; // skip blank rows

    // ── Section-boundary detection ─────────────────────────────────────────
    // (a) Another header-like row detected (≥3 keyword matches → new section header)
    const rowScore = row.filter(c => HEADER_KW.test(c.trim())).length;
    if (rowScore >= 3) break;

    // (b) Section label row: ≤2 non-empty cells AND at least one is non-numeric
    //     e.g. a row containing just "Orders" or "Deals"
    const nonEmpty = row.filter(c => c.trim());
    if (
      nonEmpty.length <= 2 &&
      nonEmpty.some(c => !/^[\d.,+\-\s%()]+$/.test(c.trim()))
    ) break;
    // ──────────────────────────────────────────────────────────────────────

    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = (row[idx] ?? "").trim(); });
    result.push(obj);
  }
  return result;
}

async function parseCSV(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    // Parse as raw arrays — let smartHeaderRows find the real header row
    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: true,
      complete: (r) => resolve(smartHeaderRows(r.data as string[][])),
      error: (e) => reject(e),
    });
  });
}

async function parseExcel(file: File): Promise<Record<string, string>[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true, cellText: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  // header: 1 → returns arrays, so we can apply smartHeaderRows
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" }) as unknown[][];
  const rows = raw.map(r => r.map(c => (c === null || c === undefined ? "" : String(c))));
  return smartHeaderRows(rows);
}

async function parseHTML(file: File): Promise<Record<string, string>[]> {
  // MT5 (and many broker platforms) export HTML in UTF-16 LE with a BOM.
  // file.text() defaults to UTF-8 and produces garbage — detect and decode properly.
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let html: string;
  if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
    html = new TextDecoder("utf-16le").decode(buffer);
  } else if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
    html = new TextDecoder("utf-16be").decode(buffer);
  } else {
    html = new TextDecoder("utf-8").decode(buffer);
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  const tables = Array.from(doc.querySelectorAll("table"));
  if (!tables.length) return [];

  // Pick the FIRST table whose header row has ≥5 keyword matches.
  // MT5 HTML has Positions → Orders → Deals tables in that order; by taking
  // the first qualifying table we always land on Positions (the one we want).
  // If no table reaches 5, fall back to the highest-scoring one.
  let bestTable = tables[0];
  let bestScore = -1;
  outer: for (const tbl of tables) {
    const tblRows = tbl.querySelectorAll("tr");
    for (let r = 0; r < Math.min(8, tblRows.length); r++) {
      let score = 0;
      tblRows[r].querySelectorAll("td,th").forEach((c) => {
        if (HEADER_KW.test(c.textContent?.trim() ?? "")) score++;
      });
      if (score >= 5) {
        // First table that meets the threshold wins
        bestTable = tbl;
        bestScore = score;
        break outer;
      }
      if (score > bestScore) { bestScore = score; bestTable = tbl; }
    }
  }

  const rows = Array.from(bestTable.querySelectorAll("tr"));

  // MT5 HTML embeds <td class="hidden" colspan="8"> spacer cells in every data
  // row — they have no header equivalent and must be skipped to keep column
  // indices aligned with the header row.
  const visibleCells = (row: Element): Element[] =>
    Array.from(row.querySelectorAll("td,th")).filter(
      (c) => !c.classList.contains("hidden")
    );

  // Find header row — first row where ≥3 visible cells match header keywords
  let headerIdx = 0;
  for (let r = 0; r < Math.min(10, rows.length); r++) {
    const cells = visibleCells(rows[r]);
    const matches = cells.filter(c => HEADER_KW.test(c.textContent?.trim() ?? "")).length;
    if (matches >= 3) { headerIdx = r; break; }
  }

  // Build unique headers from visible cells only
  const seen: Record<string, number> = {};
  const headers = visibleCells(rows[headerIdx]).map((c, i) => {
    const raw = c.textContent?.trim() || `__COL_${i}`;
    if (seen[raw] !== undefined) { seen[raw]++; return `${raw}_${seen[raw]}`; }
    seen[raw] = 0;
    return raw;
  });

  // Extract data rows. Skip hidden cells. Stop at section boundaries.
  const result: Record<string, string>[] = [];
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const cells = visibleCells(rows[r]);

    // ── Section-boundary detection ─────────────────────────────────────────
    // (a) Another header-like row (≥3 keyword matches → new section header)
    const rowScore = cells.filter(c => HEADER_KW.test(c.textContent?.trim() ?? "")).length;
    if (rowScore >= 3) break;

    // (b) Section label row: ≤2 non-empty cells, at least one non-numeric
    //     e.g. <th colspan="14"><b>Orders</b></th>
    const nonEmpty = cells.filter(c => c.textContent?.trim());
    if (
      nonEmpty.length <= 2 &&
      nonEmpty.some(c => !/^[\d.,+\-\s%()]+$/.test(c.textContent?.trim() ?? ""))
    ) break;
    // ──────────────────────────────────────────────────────────────────────

    if (cells.length < 4) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i]?.textContent?.trim() ?? ""; });
    if (!row[headers[0]] && !row[headers[1]] && !row[headers[2]]) continue;
    result.push(row);
  }
  return result;
}

async function parseFile(file: File): Promise<Record<string, string>[]> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "csv") return parseCSV(file);
  if (ext === "xlsx" || ext === "xls") return parseExcel(file);
  if (ext === "htm" || ext === "html") return parseHTML(file);
  throw new Error("unsupported");
}

const ACCEPTED = ".csv,.xlsx,.xls,.htm,.html";

function mapRowsToTrades(
  rawRows: Record<string, string>[],
  broker: BrokerConfig,
  currentTradeCount: number,
  isFree: boolean
): ParsedTrade[] {
  if (rawRows.length === 0) return [];
  const headers = Object.keys(rawRows[0]);
  const idx = buildHeaderIndex(headers);

  let validIndex = 0; // tracks how many valid rows we've seen (for overLimit calc)

  return rawRows.map((row) => {
    const getValue = (mapping: FieldMapping) => {
      const raw = resolveAlias(row, idx, mapping);
      if (raw === null) return null;
      if (mapping.transform) return mapping.transform(raw);
      return raw;
    };

    const asset = getValue(broker.mappings.find((m) => m.field === "asset")!) as string | null;
    const direction = getValue(broker.mappings.find((m) => m.field === "direction")!) as "LONG" | "SHORT" | null;
    const entry = getValue(broker.mappings.find((m) => m.field === "entry")!) as number | null;

    const slMapping = broker.mappings.find((m) => m.field === "sl");
    const sl = slMapping ? (getValue(slMapping) as number | null) : null;
    const tpMapping = broker.mappings.find((m) => m.field === "tp");
    const tp = tpMapping ? (getValue(tpMapping) as number | null) : null;

    const rrMapping = broker.mappings.find((m) => m.field === "rr");
    let rr = rrMapping ? (getValue(rrMapping) as number | null) : null;
    if (rr === null && entry !== null && sl !== null && tp !== null) {
      rr = calcRR(entry, sl, tp);
    }

    const lotMapping = broker.mappings.find((m) => m.field === "lot_size");
    const lot_size = lotMapping ? (getValue(lotMapping) as number | null) : null;

    const pnlMapping = broker.mappings.find((m) => m.field === "pnl");
    const pnl = pnlMapping ? (getValue(pnlMapping) as number | null) : null;

    const resultMapping = broker.mappings.find((m) => m.field === "result");
    const result = resultMapping
      ? (getValue(resultMapping) as "win" | "loss" | "be" | null)
      : deriveResult(pnl);

    // Date
    let dateRaw: string | null = null;
    if (broker.dateColumn) {
      const dateKey = idx[broker.dateColumn.trim().toLowerCase()];
      if (dateKey) dateRaw = row[dateKey] ?? null;
    }
    const created_at = parseDate(dateRaw, broker.dateFormat);

    const _valid = !!(asset && direction && entry !== null);

    let _overLimit = false;
    if (_valid) {
      if (isFree && currentTradeCount + validIndex >= FREE_LIMIT) {
        _overLimit = true;
      }
      validIndex++;
    }

    return { asset, direction, entry, sl, tp, rr, lot_size, pnl, result, created_at, _valid, _overLimit };
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function BrokerList({
  selected,
  onSelect,
  categoryLabel,
}: {
  selected: BrokerConfig | null;
  onSelect: (b: BrokerConfig) => void;
  categoryLabel: (key: BrokerConfig["category"]) => string;
}) {
  const grouped = CATEGORIES.map(({ key }) => ({
    key,
    label: categoryLabel(key),
    brokers: BROKERS.filter((b) => b.category === key),
  })).filter((g) => g.brokers.length > 0);

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[280px] md:max-h-[340px] pr-1">
      {grouped.map((group) => (
        <div key={group.key}>
          <div className="text-[9px] font-medium text-text-3 uppercase tracking-[0.1em] mb-1.5">
            {group.label}
          </div>
          <div className="flex flex-col gap-0.5">
            {group.brokers.map((broker) => (
              <button
                key={broker.id}
                onClick={() => onSelect(broker)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-dm-sans transition-colors ${
                  selected?.id === broker.id
                    ? "bg-text text-bg font-medium"
                    : "text-text hover:bg-surface2"
                }`}
              >
                {broker.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function InstructionPanel({
  broker,
  steps,
  notes,
  notesLabel,
}: {
  broker: BrokerConfig;
  steps: string[];
  notes?: string;
  notesLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-[13px] font-medium text-text mb-1">{broker.name}</div>
      <ol className="flex flex-col gap-2">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-surface2 border border-border flex items-center justify-center text-[10px] font-medium text-text-2 font-dm-mono">
              {i + 1}
            </span>
            <span className="text-[12px] text-text-2 leading-[1.55] pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
      {notes && (
        <div className="mt-1 p-3 bg-amber-bg rounded-lg border-l-2 border-[var(--amber)]">
          <span className="text-[10px] font-medium text-[var(--amber)] uppercase tracking-wide">
            {notesLabel}:{" "}
          </span>
          <span className="text-[11px] text-text-2">{notes}</span>
        </div>
      )}
    </div>
  );
}

function Dropzone({
  onFile,
  label,
  sub,
}: {
  onFile: (f: File) => void;
  label: string;
  sub: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`mt-4 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
        dragging
          ? "border-text bg-surface2"
          : "border-border hover:border-[var(--border-dark)] hover:bg-surface2"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <div className="flex flex-col items-center gap-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-text-3"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
        </svg>
        <span className="text-[13px] font-medium text-text">{label}</span>
        <span className="text-[11px] text-text-3">{sub}</span>
      </div>
    </div>
  );
}

function PreviewTable({
  rows,
  isPro,
  remainingFree,
  invalidCount,
  warningFree,
  warning2Free,
  upgradePrompt,
  invalidLabel,
}: {
  rows: ParsedTrade[];
  isPro: boolean;
  remainingFree: number;
  invalidCount: number;
  warningFree: string;
  warning2Free: string;
  upgradePrompt: string;
  invalidLabel: string;
}) {
  const overLimitRows = rows.filter((r) => r._valid && r._overLimit).length;

  return (
    <div className="flex flex-col gap-3">
      {!isPro && overLimitRows > 0 && (
        <div className="p-3 bg-amber-bg rounded-lg border border-[var(--amber)] text-[11px] text-text-2 leading-[1.5]">
          <span className="font-medium text-[var(--amber)]">{warningFree} {remainingFree} {warning2Free}</span>
          {" "}
          <a href="/settings" className="underline text-[var(--amber)]">{upgradePrompt}</a>
        </div>
      )}
      {invalidCount > 0 && (
        <div className="text-[11px] text-text-3">{invalidCount} {invalidLabel}</div>
      )}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-[11px] font-dm-mono">
          <thead>
            <tr className="bg-surface2 border-b border-border">
              {["Asset", "Dir", "Entry", "SL", "TP", "R:R", "Lot", "P&L", "Result", "Date"].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 text-left text-[9px] font-medium text-text-3 uppercase tracking-[0.08em] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const dimmed = !row._valid || row._overLimit;
              return (
                <tr
                  key={i}
                  className={`border-b border-border last:border-0 ${dimmed ? "opacity-40" : ""}`}
                >
                  <td className="px-3 py-2 font-medium text-text whitespace-nowrap">
                    {row.asset || "—"}
                    {row._overLimit && (
                      <span className="ml-1 text-[9px]">🔒</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {row.direction ? (
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                        style={{
                          background: row.direction === "LONG" ? "var(--green-bg)" : "var(--red-bg)",
                          color: row.direction === "LONG" ? "var(--green)" : "var(--red)",
                        }}
                      >
                        {row.direction}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2 text-text">{row.entry ?? "—"}</td>
                  <td className="px-3 py-2 text-text-2">{row.sl ?? "—"}</td>
                  <td className="px-3 py-2 text-text-2">{row.tp ?? "—"}</td>
                  <td className="px-3 py-2 text-text-2">{row.rr !== null ? `${row.rr.toFixed(2)}R` : "—"}</td>
                  <td className="px-3 py-2 text-text-2">{row.lot_size ?? "—"}</td>
                  <td
                    className="px-3 py-2 font-medium"
                    style={{
                      color: row.pnl === null ? undefined : row.pnl > 0 ? "var(--green)" : row.pnl < 0 ? "var(--red)" : "var(--text-2)",
                    }}
                  >
                    {row.pnl !== null ? (row.pnl >= 0 ? `+${row.pnl.toFixed(2)}` : row.pnl.toFixed(2)) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {row.result ? (
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase"
                        style={{
                          background: row.result === "win" ? "var(--green-bg)" : row.result === "loss" ? "var(--red-bg)" : "var(--amber-bg)",
                          color: row.result === "win" ? "var(--green)" : row.result === "loss" ? "var(--red)" : "var(--amber)",
                        }}
                      >
                        {row.result}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2 text-text-3 whitespace-nowrap">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function ImportTradesModal({
  open,
  onClose,
  onImported,
  profile,
  currentTradeCount,
}: Props) {
  const { t } = useLanguage();
  const j = t.journal;

  const [step, setStep] = useState<"select" | "preview" | "importing">("select");
  const [selectedBroker, setSelectedBroker] = useState<BrokerConfig | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedTrade[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);

  const isPro = profile?.plan !== "free";
  const validRows = parsedRows.filter((r) => r._valid && !r._overLimit);
  const invalidCount = parsedRows.filter((r) => !r._valid).length;
  const remainingFree = Math.max(0, FREE_LIMIT - currentTradeCount);

  const categoryLabel = (key: BrokerConfig["category"]): string => {
    if (key === "forex") return j.importCategoryForex;
    if (key === "crypto") return j.importCategoryCrypto;
    if (key === "stock") return j.importCategoryStock;
    return j.importCategoryPaper;
  };

  async function handleFile(file: File) {
    if (!selectedBroker) return;
    setParseError(null);
    setDetectedHeaders([]);
    try {
      const raw = await parseFile(file);
      if (raw.length === 0) {
        setParseError(j.importParseError);
        return;
      }
      // Save detected headers for diagnostics
      setDetectedHeaders(Object.keys(raw[0]));
      const rows = mapRowsToTrades(raw, selectedBroker, currentTradeCount, !isPro);
      setParsedRows(rows);
      setStep("preview");
    } catch {
      setParseError(j.importParseError);
    }
  }

  async function handleImport() {
    setStep("importing");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setStep("preview"); return; }

    const toInsert = validRows.map((r) => ({
      user_id: user.id,
      asset: r.asset,
      direction: r.direction,
      entry: r.entry,
      sl: r.sl,
      tp: r.tp,
      rr: r.rr,
      lot_size: r.lot_size,
      pnl: r.pnl,
      result: r.result,
      created_at: r.created_at,
    }));

    // Batch insert — 50 rows at a time
    for (let i = 0; i < toInsert.length; i += 50) {
      const batch = toInsert.slice(i, i + 50);
      await supabase.from("trades").insert(batch);
    }

    onImported(toInsert.length);
    handleClose();
  }

  function handleClose() {
    setStep("select");
    setSelectedBroker(null);
    setParsedRows([]);
    setParseError(null);
    setDetectedHeaders([]);
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="bg-bg border border-border rounded-2xl shadow-[var(--shadow-hover)] w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-fraunces text-[18px] font-light text-text tracking-[-0.3px]">
            {j.importTitle}
          </h2>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-surface2 text-text-2 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === "select" && (
            <div className="flex flex-col gap-4">
              {/* Split panel */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Left: broker list */}
                <div className="md:w-48 flex-shrink-0">
                  <div className="text-[10px] font-medium text-text-3 uppercase tracking-[0.08em] mb-2">
                    {j.importSelectBroker}
                  </div>
                  <BrokerList
                    selected={selectedBroker}
                    onSelect={setSelectedBroker}
                    categoryLabel={categoryLabel}
                  />
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px bg-border flex-shrink-0" />

                {/* Right: instructions */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium text-text-3 uppercase tracking-[0.08em] mb-2">
                    {j.importInstructions}
                  </div>
                  {selectedBroker ? (
                    <InstructionPanel
                      broker={selectedBroker}
                      steps={
                        (j.importBrokers as unknown as Record<string, { steps: string[]; notes?: string }>)[selectedBroker.id]?.steps
                        ?? selectedBroker.steps
                      }
                      notes={
                        (j.importBrokers as unknown as Record<string, { steps: string[]; notes?: string }>)[selectedBroker.id]?.notes
                        ?? selectedBroker.notes
                      }
                      notesLabel={j.importNotes}
                    />
                  ) : (
                    <p className="text-[12px] text-text-3 leading-[1.6]">{j.importNoInstructions}</p>
                  )}
                </div>
              </div>

              {/* Dropzone */}
              {selectedBroker && (
                <>
                  {parseError && (
                    <div className="p-3 rounded-lg bg-red-bg border border-[var(--red)] text-[12px] text-[var(--red)]">
                      {parseError}
                    </div>
                  )}
                  <Dropzone
                    onFile={handleFile}
                    label={j.importDropzone}
                    sub={j.importDropzoneSub}
                  />
                </>
              )}
            </div>
          )}

          {(step === "preview" || step === "importing") && (
            <div className="flex flex-col gap-3">
              <div className="text-[11px] text-text-2">
                <span className="font-medium text-text">{parsedRows.filter((r) => r._valid).length}</span>{" "}
                {j.importPreviewSub}
              </div>

              {/* Diagnostics: show detected columns when 0 valid trades */}
              {parsedRows.filter((r) => r._valid).length === 0 && detectedHeaders.length > 0 && (
                <div className="p-3 rounded-xl border border-border bg-surface2 text-[11px] text-text-2">
                  <div className="font-medium text-text mb-1.5">Detected columns ({detectedHeaders.length}):</div>
                  <div className="flex flex-wrap gap-1">
                    {detectedHeaders.map((h) => (
                      <span key={h} className="px-2 py-0.5 rounded bg-bg border border-border font-dm-mono text-[10px] text-text-2">{h}</span>
                    ))}
                  </div>
                  <div className="mt-2 text-text-3">None matched the expected columns for this broker. Check that you selected the correct broker and exported the correct report type.</div>
                </div>
              )}

              <PreviewTable
                rows={parsedRows}
                isPro={isPro}
                remainingFree={remainingFree}
                invalidCount={invalidCount}
                warningFree={j.importFreeLimitWarning}
                warning2Free={j.importFreeLimitWarning2}
                upgradePrompt={j.importUpgradePrompt}
                invalidLabel={j.importInvalidRows}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {(step === "preview" || step === "importing") && (
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-border flex-shrink-0">
            <button
              onClick={() => setStep("select")}
              disabled={step === "importing"}
              className="px-4 py-2 rounded-lg text-[13px] font-medium font-dm-sans border border-border text-text-2 hover:bg-surface2 transition-colors disabled:opacity-40"
            >
              {j.importBack}
            </button>
            <button
              onClick={handleImport}
              disabled={step === "importing" || validRows.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-medium font-dm-sans bg-text text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {step === "importing" ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  {j.importImporting}
                </>
              ) : (
                `${j.importConfirm} ${validRows.length} ${j.importTradesWord} →`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
