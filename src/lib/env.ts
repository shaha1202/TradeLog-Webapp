const SUPABASE_PLACEHOLDER_URL = "https://placeholder.supabase.co";
const SUPABASE_PLACEHOLDER_KEY = "placeholder";

export function getPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return { url, anonKey };
}

export function getOptionalPublicSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return { url: SUPABASE_PLACEHOLDER_URL, anonKey: SUPABASE_PLACEHOLDER_KEY, configured: false };
  }

  return { url, anonKey, configured: true };
}

export function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}
