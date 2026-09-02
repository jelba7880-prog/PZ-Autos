import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Anon-key client for the public showcase and landing page. Reads only from
// public_cars_view / public_car_images_view / public_featured_cars_view —
// that's what keeps supplier identity and cost price out of reach. Keep
// this file free of any elevated credential, even in comments.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
