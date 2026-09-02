import { normalizeNigerianPhone } from '@/lib/formatters'

// Client-side WhatsApp deep link only. No server-side send path — Twilio is
// explicitly out of scope for this product (single owner, direct WhatsApp
// access is part of the trust story, not an automated notification system).
export function generateWhatsAppLink(phone: string, message: string): string {
  const normalized = normalizeNigerianPhone(phone)
  const e164 = normalized.replace('+', '')
  return `https://wa.me/${e164}?text=${encodeURIComponent(message)}`
}

export function generateCarEnquiryMessage(carTitle: string): string {
  return `Hi, I'm interested in the ${carTitle} listed on PZ Autos. Is it still available?`
}
