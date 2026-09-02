import { createBrowserClient } from '@supabase/ssr'

// Browser client for the admin panel. Carries the owner's session cookie —
// every query runs as `authenticated` and is subject to the
// "owner_full_access" RLS policies (see supabase/migrations).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
