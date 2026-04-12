export type ImportableField =
  | "asset"
  | "direction"
  | "entry"
  | "sl"
  | "tp"
  | "rr"
  | "lot_size"
  | "pnl"
  | "result"
  | "created_at";

export interface FieldMapping {
  field: ImportableField;
  /** Tried in order, case-insensitive + trimmed */
  aliases: string[];
  required: boolean;
  transform?: (raw: string) => string | number | null;
}

export interface BrokerConfig {
  id: string;
  name: string;
  category: "forex" | "crypto" | "stock" | "paper";
  steps: string[];
  notes?: string;
  mappings: FieldMapping[];
  /** Which CSV column holds the trade open date/time */
  dateColumn?: string;
  dateFormat: "iso" | "mt4" | "unix_ms";
}

// ─── Shared transforms ──────────────────────────────────────────────────────

const toDirection = (v: string): "LONG" | "SHORT" | null =>
  /buy|long/i.test(v) ? "LONG" : /sell|short/i.test(v) ? "SHORT" : null;

const toFloat = (v: string): number | null => {
  const n = parseFloat(v.replace(/[^\d.+-]/g, ""));
  return isNaN(n) ? null : n;
};

// ─── Broker Configs ──────────────────────────────────────────────────────────

export const BROKERS: BrokerConfig[] = [
  // ── Forex / CFD ────────────────────────────────────────────────────────────
  {
    id: "mt4",
    name: "MetaTrader 4",
    category: "forex",
    steps: [
      "Open MetaTrader 4 and go to the Terminal panel (Ctrl+T).",
      "Click the Account History tab.",
      "Right-click anywhere in the history list.",
      'Select "Save as Report" → choose "Detailed Report".',
      "An .htm file will be saved — upload it directly here.",
    ],
    notes:
      "MT4 exports as .htm by default — upload it directly without converting to CSV.",
    // MT4 HTML uses "Time" as open-time header; CSV uses "Open Time"
    dateColumn: "Time",
    dateFormat: "mt4",
    mappings: [
      {
        field: "asset",
        // MT4 HTML uses "Item"; CSV export uses "Symbol"
        aliases: ["Item", "Symbol", "Pair", "Instrument"],
        required: true,
      },
      {
        field: "direction",
        aliases: ["Type", "Direction", "Side", "Action"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        // MT4 HTML: first "Price" column = open price
        aliases: ["Open Price", "Price", "Entry", "Open price"],
        required: true,
        transform: toFloat,
      },
      {
        field: "sl",
        aliases: ["S / L", "S/L", "Stop Loss", "SL", "Stoploss"],
        required: false,
        transform: toFloat,
      },
      {
        field: "tp",
        aliases: ["T / P", "T/P", "Take Profit", "TP", "Takeprofit"],
        required: false,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Size", "Volume", "Lot", "Lots"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["Profit", "Net Profit", "P&L", "Net P&L"],
        required: false,
        transform: toFloat,
      },
    ],
  },
  {
    id: "mt5",
    name: "MetaTrader 5",
    category: "forex",
    steps: [
      "Open MetaTrader 5 and go to View → Terminal (Ctrl+T).",
      "Click the History tab.",
      "Right-click anywhere and select Report.",
      'In the report window click "Save as" → choose HTML or XLSX.',
      "Upload the saved file here.",
    ],
    notes:
      "MT5 supports HTML and XLSX export directly — no conversion needed.",
    dateColumn: "Time",
    dateFormat: "mt4",
    mappings: [
      {
        field: "asset",
        aliases: ["Symbol", "Instrument", "Item", "Pair"],
        required: true,
      },
      {
        field: "direction",
        // MT5 Deals: "Type" = buy/sell. "Direction" = in/out (ignore).
        // MT5 Positions: "Type" or "Direction" = buy/sell
        aliases: ["Type", "Side", "Direction", "Action"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["Price", "Open Price", "Entry", "Open price", "Avg. Price"],
        required: true,
        transform: toFloat,
      },
      {
        field: "sl",
        aliases: ["S / L", "S/L", "Stop Loss", "SL"],
        required: false,
        transform: toFloat,
      },
      {
        field: "tp",
        aliases: ["T / P", "T/P", "Take Profit", "TP"],
        required: false,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Volume", "Size", "Lots", "Lot", "Qty"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["Profit", "Net Profit", "P&L", "Net P&L", "Gross Profit"],
        required: false,
        transform: toFloat,
      },
    ],
  },
  {
    id: "ctrader",
    name: "cTrader",
    category: "forex",
    steps: [
      "Log in to cTrader desktop or web.",
      'Click the History tab at the bottom of the screen.',
      'Click the export icon (arrow) in the top-right corner of the history panel.',
      "Select CSV as the export format.",
      "Choose your date range and click Export.",
      "Upload the downloaded .csv file here.",
    ],
    dateColumn: "Opening Time",
    dateFormat: "iso",
    mappings: [
      {
        field: "asset",
        aliases: ["Symbol", "Instrument"],
        required: true,
      },
      {
        field: "direction",
        aliases: ["Direction", "Trade Side", "Side", "Type"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["Entry Price", "Open Price", "Entry"],
        required: true,
        transform: toFloat,
      },
      {
        field: "sl",
        aliases: ["Stop Loss", "SL"],
        required: false,
        transform: toFloat,
      },
      {
        field: "tp",
        aliases: ["Take Profit", "TP"],
        required: false,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Volume", "Quantity", "Lots"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["Net Profit", "Profit", "P&L"],
        required: false,
        transform: toFloat,
      },
    ],
  },
  {
    id: "oanda",
    name: "Oanda",
    category: "forex",
    steps: [
      "Log in to your Oanda account at trade.oanda.com.",
      'Navigate to Account → Transaction History.',
      'Click the "Download" button in the top right.',
      "Select CSV format and your desired date range.",
      "Click Download and upload the file here.",
    ],
    dateColumn: "Transaction Date",
    dateFormat: "iso",
    mappings: [
      {
        field: "asset",
        aliases: ["Instrument", "Symbol", "Pair"],
        required: true,
      },
      {
        field: "direction",
        aliases: ["Side", "Type", "Direction"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["Price", "Avg Fill Price", "Rate"],
        required: true,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Units", "Amount", "Quantity"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["P&L", "Realized P&L", "Net P&L"],
        required: false,
        transform: toFloat,
      },
    ],
  },
  {
    id: "ib",
    name: "Interactive Brokers",
    category: "forex",
    steps: [
      "Log in to Interactive Brokers Client Portal or TWS.",
      'Go to Reports → Flex Queries or Performance & Reports → Trade Confirmations.',
      "Select the date range for your trades.",
      'Click "Download" and choose CSV format.',
      "Upload the downloaded file here.",
    ],
    notes:
      "In TWS, go to File → Export Trade Report to get a CSV directly.",
    dateColumn: "TradeDate",
    dateFormat: "iso",
    mappings: [
      {
        field: "asset",
        aliases: ["Symbol", "Instrument", "Description"],
        required: true,
      },
      {
        field: "direction",
        aliases: ["Buy/Sell", "Side", "Action"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["Price", "TradePrice", "Execution Price"],
        required: true,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Quantity", "Qty", "TradeQuantity"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["Realized P/L", "FifoPnlRealized", "P&L"],
        required: false,
        transform: toFloat,
      },
    ],
  },
  {
    id: "xm",
    name: "XM",
    category: "forex",
    steps: [
      "Log in to your XM Members Area.",
      'Go to My Account → Trading Account History.',
      "Select the account and date range.",
      'Click "Export to CSV" or open your MT4/MT5 terminal via XM.',
      "In MetaTrader, follow the MT4 or MT5 export steps above.",
      "Upload the .csv file here.",
    ],
    notes: "XM accounts run on MT4 or MT5 — use those export steps above.",
    dateColumn: "Open Time",
    dateFormat: "mt4",
    mappings: [
      {
        field: "asset",
        aliases: ["Symbol", "Pair"],
        required: true,
      },
      {
        field: "direction",
        aliases: ["Type", "Direction"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["Open Price", "Price"],
        required: true,
        transform: toFloat,
      },
      {
        field: "sl",
        aliases: ["S / L", "SL", "S/L"],
        required: false,
        transform: toFloat,
      },
      {
        field: "tp",
        aliases: ["T / P", "TP", "T/P"],
        required: false,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Volume", "Lots"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["Profit"],
        required: false,
        transform: toFloat,
      },
    ],
  },
  {
    id: "exness",
    name: "Exness",
    category: "forex",
    steps: [
      "Log in to your Exness Personal Area.",
      'Go to My Accounts → select your trading account.',
      'Click "Trade History" or open your MT4/MT5 terminal via Exness.',
      'In the terminal, go to Account History tab, right-click → "Save as Report".',
      "Open the HTML file in Excel, re-save as CSV.",
      "Upload the .csv file here.",
    ],
    notes: "Exness uses MT4/MT5 terminals — export procedure is identical.",
    dateColumn: "Open Time",
    dateFormat: "mt4",
    mappings: [
      {
        field: "asset",
        aliases: ["Symbol", "Pair"],
        required: true,
      },
      {
        field: "direction",
        aliases: ["Type", "Direction"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["Open Price", "Price"],
        required: true,
        transform: toFloat,
      },
      {
        field: "sl",
        aliases: ["S / L", "SL", "S/L"],
        required: false,
        transform: toFloat,
      },
      {
        field: "tp",
        aliases: ["T / P", "TP", "T/P"],
        required: false,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Volume", "Lots"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["Profit"],
        required: false,
        transform: toFloat,
      },
    ],
  },
  {
    id: "icmarkets",
    name: "IC Markets",
    category: "forex",
    steps: [
      "Log in to your IC Markets client area.",
      "Open your MT4 or MT5 terminal.",
      "Go to Account History tab in the Terminal panel.",
      'Right-click → "Save as Report" → Detailed Report.',
      "Open the saved .htm in Excel, re-save as .csv.",
      "Upload the file here.",
    ],
    dateColumn: "Open Time",
    dateFormat: "mt4",
    mappings: [
      {
        field: "asset",
        aliases: ["Symbol", "Pair"],
        required: true,
      },
      {
        field: "direction",
        aliases: ["Type"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["Open Price"],
        required: true,
        transform: toFloat,
      },
      {
        field: "sl",
        aliases: ["S / L", "SL", "S/L"],
        required: false,
        transform: toFloat,
      },
      {
        field: "tp",
        aliases: ["T / P", "TP", "T/P"],
        required: false,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Volume"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["Profit"],
        required: false,
        transform: toFloat,
      },
    ],
  },
  {
    id: "pepperstone",
    name: "Pepperstone",
    category: "forex",
    steps: [
      "Log in to your Pepperstone Secure Client Area.",
      "Open your MT4 or MT5 platform.",
      "Navigate to Terminal → Account History.",
      'Right-click the history list → "Save as Report".',
      "Open the .htm in Excel, save as .csv.",
      "Upload the .csv file here.",
    ],
    dateColumn: "Open Time",
    dateFormat: "mt4",
    mappings: [
      {
        field: "asset",
        aliases: ["Symbol", "Pair"],
        required: true,
      },
      {
        field: "direction",
        aliases: ["Type"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["Open Price"],
        required: true,
        transform: toFloat,
      },
      {
        field: "sl",
        aliases: ["S / L", "SL"],
        required: false,
        transform: toFloat,
      },
      {
        field: "tp",
        aliases: ["T / P", "TP"],
        required: false,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Volume"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["Profit"],
        required: false,
        transform: toFloat,
      },
    ],
  },
  {
    id: "etoro",
    name: "eToro",
    category: "forex",
    steps: [
      "Log in to your eToro account.",
      'Click your avatar → Portfolio.',
      'Select the "History" tab.',
      'Click the "Export" button (spreadsheet icon) at the top right.',
      "Choose the date range and download the Excel/CSV file.",
      "Upload the .csv file here.",
    ],
    dateColumn: "Open Date",
    dateFormat: "iso",
    mappings: [
      {
        field: "asset",
        aliases: ["Action", "Instrument", "Details"],
        required: true,
        transform: (v) => v.replace(/^(Buy|Sell)\s+/i, "").trim() || null,
      },
      {
        field: "direction",
        aliases: ["Action", "Type", "Direction"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["Open Rate", "Open Price", "Entry"],
        required: true,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Amount", "Units", "Quantity"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["Profit", "Net Profit", "P&L"],
        required: false,
        transform: toFloat,
      },
    ],
  },

  // ── Crypto ─────────────────────────────────────────────────────────────────
  {
    id: "binance",
    name: "Binance",
    category: "crypto",
    steps: [
      "Log in to your Binance account.",
      "Go to Orders → Trade History (Spot) or Futures → Trade History.",
      'Click "Export" in the top right corner.',
      "Select the date range and click Generate.",
      "Download the generated CSV and upload it here.",
    ],
    dateColumn: "Date(UTC)",
    dateFormat: "iso",
    mappings: [
      {
        field: "asset",
        aliases: ["Pair", "Symbol", "Market"],
        required: true,
      },
      {
        field: "direction",
        aliases: ["Side", "Type"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["Price", "Avg. Price", "Executed Price", "Average Price"],
        required: true,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Executed", "Amount", "Quantity", "Qty", "Filled"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["Realized Profit", "PNL", "P&L", "Profit"],
        required: false,
        transform: toFloat,
      },
    ],
  },
  {
    id: "bybit",
    name: "Bybit",
    category: "crypto",
    steps: [
      "Log in to your Bybit account.",
      'Go to Orders → Order History or Trade History.',
      'Click "Export" in the top right.',
      "Select the time range (max 2 years) and click Confirm.",
      "Download and upload the CSV file here.",
    ],
    dateColumn: "Create Time",
    dateFormat: "iso",
    mappings: [
      {
        field: "asset",
        aliases: ["Symbol", "Contract", "Instrument"],
        required: true,
      },
      {
        field: "direction",
        aliases: ["Side", "Direction", "Order Side"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["Order Price", "Avg. Fill Price", "Price", "Avg Price"],
        required: true,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Qty", "Order Qty", "Filled Qty", "Quantity"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["Closed P&L", "Realized P&L", "PNL"],
        required: false,
        transform: toFloat,
      },
    ],
  },
  {
    id: "okx",
    name: "OKX",
    category: "crypto",
    steps: [
      "Log in to your OKX account.",
      "Go to Trade → Order History.",
      'Click "Export" or the download icon.',
      "Select Filled Orders and your date range.",
      "Download the CSV file and upload it here.",
    ],
    dateColumn: "Order Time",
    dateFormat: "iso",
    mappings: [
      {
        field: "asset",
        aliases: ["Instrument", "Symbol", "Trading Pair"],
        required: true,
      },
      {
        field: "direction",
        aliases: ["Side", "Order Side", "Direction"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["Filled Price", "Avg. Fill Price", "Price"],
        required: true,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Filled Quantity", "Amount", "Size"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["P&L", "Realized P&L"],
        required: false,
        transform: toFloat,
      },
    ],
  },
  {
    id: "kraken",
    name: "Kraken",
    category: "crypto",
    steps: [
      "Log in to your Kraken account.",
      "Go to History → Trades.",
      'Click "Export" in the top right.',
      "Select the date range and choose CSV format.",
      "Download the file and upload it here.",
    ],
    dateColumn: "time",
    dateFormat: "iso",
    mappings: [
      {
        field: "asset",
        aliases: ["pair", "symbol"],
        required: true,
      },
      {
        field: "direction",
        aliases: ["type", "side"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["price"],
        required: true,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["vol", "volume", "amount"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["net", "profit", "p&l"],
        required: false,
        transform: toFloat,
      },
    ],
  },

  // ── Paper Trading ───────────────────────────────────────────────────────────
  {
    id: "tradingview",
    name: "TradingView Paper",
    category: "paper",
    steps: [
      "Open TradingView and go to the Paper Trading account.",
      "Click the clock icon (History) at the bottom of the chart.",
      'In the Trades tab, click the "Export" icon (down arrow).',
      "A CSV file will be downloaded automatically.",
      "Upload it here.",
    ],
    notes: "Only Paper Trading accounts support CSV export in TradingView.",
    dateColumn: "Date/Time",
    dateFormat: "iso",
    mappings: [
      {
        field: "asset",
        aliases: ["Symbol", "Ticker", "Instrument"],
        required: true,
      },
      {
        field: "direction",
        aliases: ["Side", "Type", "Direction"],
        required: true,
        transform: toDirection,
      },
      {
        field: "entry",
        aliases: ["Entry Price", "Price", "Avg Price"],
        required: true,
        transform: toFloat,
      },
      {
        field: "lot_size",
        aliases: ["Qty", "Quantity", "Amount"],
        required: false,
        transform: toFloat,
      },
      {
        field: "pnl",
        aliases: ["Profit", "P&L", "Net Profit"],
        required: false,
        transform: toFloat,
      },
    ],
  },
];
