import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// In production, missing env vars must be a hard failure — exporting null would
// cause cryptic null-pointer crashes deep in auth flows instead of a clear message.
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === 'undefined') {
    // Server-side: throw so the build/start fails loudly with a clear message
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[Supabase] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in production.'
      );
    }
  } else {
    // Client-side dev: warn clearly in the console
    console.error(
      '[Supabase] Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and/or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Check your .env.local file.'
    );
  }
}

export const supabase = createClient(
  supabaseUrl ?? 'http://localhost:54321',   // safe fallback for local dev only
  supabaseAnonKey ?? 'anon-key-placeholder', // safe fallback for local dev only
  {
    auth: {
      persistSession: true,       // keep session across browser tabs
      autoRefreshToken: true,     // refresh token automatically before expiry
      detectSessionInUrl: true,   // pick up magic-link/OAuth sessions from URL
    },
  }
);
