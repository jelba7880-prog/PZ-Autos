import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/showcase/rateLimiter'

// The proxy matcher (proxy.ts) only covers /admin/** and /login — /api/** is
// deliberately outside it so the public enquiry endpoint can stay
// unauthenticated. Any admin-only API route therefore has to check the session
// itself; skipping this leaves the route, and the Anthropic key behind it,
// world-callable.
//
// `scope` keeps each route's rate-limit window separate, so the two
// suggestion features can't starve one another.
//
// Returns a response to send back when the request must be refused, or null
// when the caller should proceed.
export async function refuseUnlessAdmin(scope: string): Promise<NextResponse | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Keyed on the signed-in user rather than the IP: these routes are only
  // reachable by the owner, so the thing worth capping is a runaway form
  // (a stuck retry loop burning Anthropic spend), not anonymous abuse. Being
  // limited is not an error the admin needs to see — the caller turns it into
  // "no suggestion", same as any other failure.
  if (isRateLimited(`${scope}:${user.id}`)) {
    return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 })
  }

  return null
}
