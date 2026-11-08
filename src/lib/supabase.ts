import { SupabaseClient, createClient } from "@supabase/supabase-js";

// Nycklarna läses från miljövariabler (.env.local lokalt, Settings -> Environment
// Variables på Vercel). Båda är publika och får finnas i webbläsaren; skyddet
// sköts av reglerna (RLS) i databasen. Lägg ALDRIG in service_role-nyckeln här.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);

export const supabase: SupabaseClient | null = supabaseConfigured ? createClient(url!, key!) : null;
