import Link from 'next/link'
import type { Metadata } from 'next'
import { TopContactBar } from '@/components/showcase/TopContactBar'
import { PublicHeader } from '@/components/showcase/PublicHeader'
import { PublicFooter } from '@/components/showcase/PublicFooter'
import { PublicCarCard } from '@/components/showcase/PublicCarCard'
import { SectionLabel } from '@/components/showcase/SectionLabel'
import { MakesTicker } from '@/components/showcase/MakesTicker'
import { getFeaturedCars, getActiveMakes } from '@/lib/showcase/queries'
import { generateWhatsAppLink } from '@/lib/whatsapp'

const OWNER_PHONE = process.env.NEXT_PUBLIC_OWNER_PHONE ?? '+2348116563757'

export const metadata: Metadata = {
  title: 'Pazogu Automobiles — Verified cars, direct from the owner',
}

export const revalidate = 0

export default async function LandingPage() {
  const [featured, makes] = await Promise.all([getFeaturedCars(), getActiveMakes()])

  const whatsappLink = generateWhatsAppLink(
    OWNER_PHONE,
    "Hi, I'd like to talk to you about a car."
  )

  return (
    <>
      <TopContactBar />
      <PublicHeader />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-ink">
        <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-white leading-[1.05]">
              Cars worth <span className="text-signal-red">trusting</span>,
              <br />
              verified before they reach you.
            </h1>
            <p className="font-body text-text-on-dark text-base md:text-lg mt-6 max-w-md">
              Sourced from vetted dealerships and individuals across Lagos, checked before
              listing, and re-confirmed regularly — with direct WhatsApp access to the owner,
              not a call centre.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <Link
                href="/cars"
                className="rounded-lg bg-signal-red text-white font-body font-semibold text-sm px-6 py-3.5"
              >
                Browse inventory
              </Link>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/30 text-white font-body font-semibold text-sm px-6 py-3.5"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden placeholder-stripes" />
        </div>
      </section>

      {/* ── Brands currently available (query-derived, never hardcoded) ── */}
      {makes.length > 0 && (
        <section className="border-b border-hairline bg-bg-base">
          <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-body text-[11px] font-semibold uppercase tracking-[0.3em] text-text-muted shrink-0">
              Currently available
            </span>
            <div className="min-w-0 flex-1">
              <MakesTicker makes={makes} />
            </div>
          </div>
        </section>
      )}

      {/* ── Featured (owner-curated only — no filters) ──────────────── */}
      <section className="mx-auto max-w-[1280px] px-4 md:px-10 py-14 md:py-20">
        <SectionLabel>Featured</SectionLabel>
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display font-black text-2xl md:text-3xl text-ink">
            Handpicked by the owner
          </h2>
          <Link
            href="/cars"
            className="hidden md:inline font-body text-sm font-semibold text-ink hover:underline"
          >
            View all inventory →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="font-body text-text-muted">
            No cars are featured right now — see the full inventory instead.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {featured.map((car, index) => (
              <div key={car.id} className={index >= 4 ? 'hidden md:block' : ''}>
                <PublicCarCard car={car} />
              </div>
            ))}
          </div>
        )}

        <Link
          href="/cars"
          className="md:hidden mt-6 inline-block font-body text-sm font-semibold text-ink hover:underline"
        >
          View all inventory →
        </Link>
      </section>

      {/* ── Why Pazogu — verification-based trust story, not possession ── */}
      <section className="bg-placeholder-b">
        <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-14 md:py-20">
          <SectionLabel>Why Pazogu</SectionLabel>
          <h2 className="font-display font-black text-2xl md:text-3xl text-ink mb-10">
            What we actually check, every time
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <WhyCard
              number="01"
              title="Verified before listing"
              body="Every car is checked against the seller's paperwork and current condition before it goes live — and re-confirmed with the seller on a regular schedule after that."
            />
            <WhyCard
              number="02"
              title="Price on the tag"
              body="What you see is the price. No agent fees appearing later, no last-minute additions."
            />
            <WhyCard
              number="03"
              title="Documentation support"
              body="Registration and transfer paperwork guided through to completion, alongside the seller."
            />
            <WhyCard
              number="04"
              title="Direct access"
              body="You deal with the owner on WhatsApp — not a call centre, not a rotating sales desk."
            />
          </div>
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────────────────── */}
      {/* Ink, not a signal-red fill — the brand ratio rule explicitly rules
          out a large red fill. WhatsApp stays the section's one red CTA;
          the phone link is the plain secondary (ink-outline-on-dark
          equivalent: white 1px outline). */}
      <section className="bg-ink">
        <div className="mx-auto max-w-[1280px] px-4 md:px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h2 className="font-display font-black text-2xl md:text-3xl text-white">
              Serious about a car?
            </h2>
            <p className="font-body text-text-on-dark text-sm mt-1">
              Message the owner directly — no forms, no call centre.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`tel:${OWNER_PHONE}`}
              className="rounded-lg border border-white/30 text-white font-body font-semibold text-sm px-6 py-3"
            >
              {OWNER_PHONE}
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-signal-red text-white font-body font-semibold text-sm px-6 py-3"
            >
              WhatsApp us
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  )
}

function WhyCard({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-bg-base p-5">
      <span className="font-mono text-xs text-text-muted">{number}</span>
      <h3 className="font-display font-bold text-ink text-base mt-2 mb-1.5">{title}</h3>
      <p className="font-body text-sm text-text-muted leading-relaxed">{body}</p>
    </div>
  )
}
