import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isRateLimited } from '@/lib/showcase/rateLimiter'
import { normalizeNigerianPhone, isPlausiblePhoneNumber } from '@/lib/formatters'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, phone, message, carId } = body as {
    name?: string
    phone?: string
    message?: string
    carId?: string
  }

  if (!phone || typeof phone !== 'string') {
    return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
  }

  const normalizedPhone = normalizeNigerianPhone(phone)
  if (!isPlausiblePhoneNumber(normalizedPhone)) {
    return NextResponse.json({ error: 'Phone number looks incomplete' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const insertRow = {
    car_id: carId ?? null,
    name: name?.slice(0, 200) ?? null,
    phone: normalizedPhone,
    message: message?.slice(0, 2000) ?? null,
    source: 'website',
  }

  const { error } = await supabase.from('enquiries').insert(insertRow)

  if (error) {
    // An FK/cast failure on car_id (stale link, malformed id) shouldn't lose
    // the enquiry itself — retry once with the car reference dropped.
    if (carId) {
      const { error: retryError } = await supabase
        .from('enquiries')
        .insert({ ...insertRow, car_id: null })

      if (!retryError) {
        return NextResponse.json({ ok: true })
      }
      console.error('Enquiry insert failed on retry:', retryError)
      return NextResponse.json({ error: 'Could not save enquiry' }, { status: 500 })
    }

    console.error('Enquiry insert failed:', error)
    return NextResponse.json({ error: 'Could not save enquiry' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
