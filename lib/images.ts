const BUCKET = 'car-images'

// car-images is a public bucket, so its object URLs are fully deterministic
// from the project URL + path — no Supabase client call needed just to
// resolve a URL for display. Used on both server and client.
export function getCarImagePublicUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '')
  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}`
}
