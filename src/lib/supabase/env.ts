/**
 * Supabase connection settings. Only the public (anon / publishable) key is
 * used — RLS policies in supabase/migrations enforce who can read what.
 * Never put the service-role key in this project.
 */
export function supabaseEnv() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY (see .env.example).",
    );
  }
  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  try {
    supabaseEnv();
    return true;
  } catch {
    return false;
  }
}
