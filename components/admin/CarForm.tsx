'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SupplierPicker } from './SupplierPicker'
import { ImageUploader, type PendingImage } from './ImageUploader'
import { createCarWithImages } from '@/lib/supabase/storage'
import { generateCarSlug } from '@/lib/slugify'
import type { Supplier } from '@/lib/supabase/types'

interface CarFormProps {
  suppliers: Pick<Supplier, 'id' | 'name' | 'supplier_type'>[]
}

const CURRENT_YEAR = new Date().getFullYear()

export function CarForm({ suppliers: initialSuppliers }: CarFormProps) {
  const router = useRouter()
  const [folderId] = useState(() => crypto.randomUUID())
  const [suppliers, setSuppliers] = useState(initialSuppliers)
  const [supplierId, setSupplierId] = useState('')
  const [images, setImages] = useState<PendingImage[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)
    const make = String(form.get('make') ?? '').trim()
    const model = String(form.get('model') ?? '').trim()
    const year = Number(form.get('year'))
    const askingPrice = Number(form.get('asking_price_ngn'))
    const costPriceRaw = form.get('cost_price_ngn')
    const status = String(form.get('status') ?? 'draft') as 'draft' | 'available' | 'reserved'
    const keyFeaturesRaw = String(form.get('key_features') ?? '')

    if (!supplierId) {
      setError('Select or create a supplier')
      return
    }
    if (!make || !model || !year || !askingPrice) {
      setError('Make, model, year and asking price are required')
      return
    }
    if (images.length === 0) {
      setError('Add at least one photo')
      return
    }

    setSubmitting(true)

    try {
      const slug = generateCarSlug(year, make, model)

      await createCarWithImages(
        folderId,
        {
          slug,
          supplier_id: supplierId,
          make,
          model,
          year,
          trim: (form.get('trim') as string) || null,
          body_type: (form.get('body_type') as string) || null,
          transmission: (form.get('transmission') as string) || null,
          fuel_type: (form.get('fuel_type') as string) || null,
          mileage_km: form.get('mileage_km') ? Number(form.get('mileage_km')) : null,
          exterior_colour: (form.get('exterior_colour') as string) || null,
          interior_colour: (form.get('interior_colour') as string) || null,
          engine: (form.get('engine') as string) || null,
          drivetrain: (form.get('drivetrain') as string) || null,
          condition: (form.get('condition') as string) || null,
          description: (form.get('description') as string) || null,
          key_features: keyFeaturesRaw
            ? keyFeaturesRaw.split(',').map((s) => s.trim()).filter(Boolean)
            : null,
          location_area: (form.get('location_area') as string) || null,
          vin: (form.get('vin') as string) || null,
          registration_plate: (form.get('registration_plate') as string) || null,
          cost_price_ngn: costPriceRaw ? Number(costPriceRaw) : null,
          asking_price_ngn: askingPrice,
          status,
          acquisition_notes: (form.get('acquisition_notes') as string) || null,
        },
        images.map((img, index) => ({
          storage_path: img.storagePath,
          is_cover: img.isCover,
          sort_order: index,
        }))
      )

      router.push('/admin')
      router.refresh()
    } catch (err) {
      console.error(err)
      setError('Could not save this car. Nothing was created — check the fields and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Field label="Supplier">
        <SupplierPicker
          suppliers={suppliers}
          value={supplierId}
          onChange={setSupplierId}
          onSupplierCreated={(s) => setSuppliers((prev) => [...prev, s])}
        />
      </Field>

      <Field label="Photos">
        <ImageUploader folderId={folderId} images={images} onChange={setImages} />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Make"><Input name="make" required /></Field>
        <Field label="Model"><Input name="model" required /></Field>
        <Field label="Year">
          <Input name="year" type="number" min={1980} max={CURRENT_YEAR + 1} required />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Asking price (₦)"><Input name="asking_price_ngn" type="number" min={1} required /></Field>
        <Field label="Cost price (₦, admin only)"><Input name="cost_price_ngn" type="number" min={0} /></Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Trim"><Input name="trim" /></Field>
        <Field label="Body type"><Input name="body_type" placeholder="Saloon, SUV…" /></Field>
        <Field label="Condition"><Input name="condition" /></Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Transmission"><Input name="transmission" placeholder="Automatic" /></Field>
        <Field label="Fuel type"><Input name="fuel_type" placeholder="Petrol" /></Field>
        <Field label="Mileage (km)"><Input name="mileage_km" type="number" min={0} /></Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Exterior colour"><Input name="exterior_colour" /></Field>
        <Field label="Interior colour"><Input name="interior_colour" /></Field>
        <Field label="Drivetrain"><Input name="drivetrain" placeholder="AWD, FWD…" /></Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Engine"><Input name="engine" /></Field>
        <Field label="Location (LGA — never a street address)"><Input name="location_area" placeholder="Ikeja" /></Field>
      </div>

      <Field label="Key features (comma-separated)">
        <Input name="key_features" placeholder="Reverse camera, Leather seats, Sunroof" />
      </Field>

      <Field label="Description">
        <textarea
          name="description"
          rows={4}
          className="w-full border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="VIN (admin only)"><Input name="vin" /></Field>
        <Field label="Registration plate (admin only)"><Input name="registration_plate" /></Field>
      </div>

      <Field label="Acquisition notes (admin only)">
        <textarea
          name="acquisition_notes"
          rows={2}
          className="w-full border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink"
        />
      </Field>

      <Field label="Status">
        <select
          name="status"
          defaultValue="draft"
          className="border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink"
        >
          <option value="draft">Draft (not public yet)</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
        </select>
      </Field>

      {error && <p className="font-body text-sm text-signal-red">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-signal-red text-white font-body font-semibold text-sm px-6 py-3 disabled:opacity-60"
      >
        {submitting ? 'Saving…' : 'Save car'}
      </button>
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block font-body text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink"
    />
  )
}
