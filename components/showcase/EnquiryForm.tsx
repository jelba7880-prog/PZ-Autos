'use client'

import { useState } from 'react'
import { generateWhatsAppLink, generateCarEnquiryMessage } from '@/lib/whatsapp'

const OWNER_PHONE = process.env.NEXT_PUBLIC_OWNER_PHONE ?? '+2348116563757'

interface EnquiryFormProps {
  carId: string
  carTitle: string
}

export function EnquiryForm({ carId, carTitle }: EnquiryFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          message: generateCarEnquiryMessage(carTitle),
          carId,
        }),
      })
      if (!res.ok) throw new Error('failed')
      setStatus('sent')

      window.open(
        generateWhatsAppLink(OWNER_PHONE, generateCarEnquiryMessage(carTitle)),
        '_blank',
        'noopener,noreferrer'
      )
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink"
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-lg bg-signal-red text-white font-body font-semibold text-sm py-3 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : 'Chat on WhatsApp'}
      </button>

      {status === 'sent' && (
        <p className="font-body text-xs text-text-muted text-center">
          Sent — opening WhatsApp now.
        </p>
      )}
      {status === 'error' && (
        <p className="font-body text-xs text-signal-red text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  )
}
