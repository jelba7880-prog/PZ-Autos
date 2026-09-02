'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function setCarFeatured(carId: string, featured: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.rpc('set_car_featured', {
    p_car_id: carId,
    p_featured: featured,
  })
  if (error) throw error
  revalidatePath('/admin')
  revalidatePath('/')
}

// Arrow-button reordering: swap the given car with its neighbour in the
// current featured_order sequence, then push the whole sequence through
// reorder_featured. Two DB round trips (read current order, then rewrite
// it) rather than a single clever UPDATE — this list is at most 6 rows, so
// the simplicity is worth more than the extra round trip.
async function swapFeatured(carId: string, direction: 'up' | 'down') {
  const supabase = await createClient()

  const { data: featured, error } = await supabase
    .from('cars')
    .select('id, featured_order')
    .eq('is_featured', true)
    .order('featured_order', { ascending: true })

  if (error) throw error
  if (!featured) return

  const ids = featured.map((c) => c.id as string)
  const index = ids.indexOf(carId)
  if (index === -1) return

  const swapWith = direction === 'up' ? index - 1 : index + 1
  if (swapWith < 0 || swapWith >= ids.length) return

  const tmp = ids[index]!
  ids[index] = ids[swapWith]!
  ids[swapWith] = tmp

  const { error: reorderError } = await supabase.rpc('reorder_featured', {
    p_ordered_ids: ids,
  })
  if (reorderError) throw reorderError

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function moveFeaturedUp(carId: string) {
  await swapFeatured(carId, 'up')
}

export async function moveFeaturedDown(carId: string) {
  await swapFeatured(carId, 'down')
}

export async function markVerified(carId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('cars')
    .update({ last_verified_at: new Date().toISOString() })
    .eq('id', carId)
  if (error) throw error
  revalidatePath('/admin')
}

export async function updateCarStatus(
  carId: string,
  status: 'draft' | 'available' | 'reserved' | 'sold' | 'withdrawn',
  archiveReason?: string
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('cars')
    .update({
      status,
      archive_reason: status === 'sold' || status === 'withdrawn' ? (archiveReason ?? null) : null,
    })
    .eq('id', carId)
  if (error) throw error
  revalidatePath('/admin')
  revalidatePath('/admin/archive')
  revalidatePath('/')
  revalidatePath('/cars')
}
