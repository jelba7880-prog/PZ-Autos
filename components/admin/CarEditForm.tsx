'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ImageUploader, type PendingImage } from './ImageUploader'
import { getCarImagePublicUrl } from '@/lib/images'
import type { Car, CarImage } from '@/lib/supabase/types'

interface CarEditFormProps {
  car: Car
  images: CarImage[]
}

export function CarEditForm({ car, images: initialImages }: CarEditFormProps) {
  const router = useRouter()
  const [images, setImages] = useState<PendingImage[]>(
    initialImages.map((img) => ({
      storagePath: img.storage_path,
      publicUrl: getCarImagePublicUrl(img.storage_path),
      isCover: img.is_cover,
    }))
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState(car.status)
  const [archiveReason, setArchiveReason] = useState(car.archive_reason ?? '')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('cars')
      .update({
        make: String(form.get('make')),
        model: String(form.get('model')),
        year: Number(form.get('year')),
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
        location_area: (form.get('location_area') as string) || null,
        vin: (form.get('vin') as string) || null,
        registration_plate: (form.get('registration_plate') as string) || null,
        cost_price_ngn: form.get('cost_price_ngn') ? Number(form.get('cost_price_ngn')) : null,
        asking_price_ngn: Number(form.get('asking_price_ngn')),
        status,
        archive_reason: status === 'sold' || status === 'withdrawn' ? archiveReason || null : null,
        acquisition_notes: (form.get('acquisition_notes') as string) || null,
      })
      .eq('id', car.id)

    if (updateError) {
      setError('Could not save changes.')
      setSaving(false)
      return
    }

    // Reconcile car_images against the current `images` state: delete rows
    // no longer present, insert new ones, sync cover/order for the rest.
    const currentPaths = new Set(images.map((img) => img.storagePath))
    const originalPaths = new Set(initialImages.map((img) => img.storage_path))

    const toDelete = initialImages.filter((img) => !currentPaths.has(img.storage_path))
    const toInsert = images.filter((img) => !originalPaths.has(img.storagePath))
    const toUpdate = images.filter((img) => originalPaths.has(img.storagePath))

    if (toDelete.length > 0) {
      await supabase
        .from('car_images')
        .delete()
        .in('id', toDelete.map((img) => img.id))
    }

    for (const img of toInsert) {
      await supabase.from('car_images').insert({
        car_id: car.id,
        storage_path: img.storagePath,
        is_cover: img.isCover,
        sort_order: images.indexOf(img),
      })
    }

    for (const img of toUpdate) {
      const original = initialImages.find((o) => o.storage_path === img.storagePath)!
      const newSortOrder = images.indexOf(img)
      if (original.is_cover !== img.isCover || original.sort_order !== newSortOrder) {
        await supabase
          .from('car_images')
          .update({ is_cover: img.isCover, sort_order: newSortOrder })
          .eq('id', original.id)
      }
    }

    router.push('/admin')
    router.refresh()
  }

  const isTerminal = status === 'sold' || status === 'withdrawn'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Field label="Photos">
        <ImageUploader
          folderId={`car-${car.id}`}
          images={images}
          onChange={setImages}
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Make"><Input name="make" defaultValue={car.make} required /></Field>
        <Field label="Model"><Input name="model" defaultValue={car.model} required /></Field>
        <Field label="Year"><Input name="year" type="number" defaultValue={car.year} required /></Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Asking price (₦)">
          <Input name="asking_price_ngn" type="number" defaultValue={car.asking_price_ngn} required />
        </Field>
        <Field label="Cost price (₦, admin only)">
          <Input name="cost_price_ngn" type="number" defaultValue={car.cost_price_ngn ?? ''} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Trim"><Input name="trim" defaultValue={car.trim ?? ''} /></Field>
        <Field label="Body type"><Input name="body_type" defaultValue={car.body_type ?? ''} /></Field>
        <Field label="Condition"><Input name="condition" defaultValue={car.condition ?? ''} /></Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Transmission"><Input name="transmission" defaultValue={car.transmission ?? ''} /></Field>
        <Field label="Fuel type"><Input name="fuel_type" defaultValue={car.fuel_type ?? ''} /></Field>
        <Field label="Mileage (km)"><Input name="mileage_km" type="number" defaultValue={car.mileage_km ?? ''} /></Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Exterior colour"><Input name="exterior_colour" defaultValue={car.exterior_colour ?? ''} /></Field>
        <Field label="Interior colour"><Input name="interior_colour" defaultValue={car.interior_colour ?? ''} /></Field>
        <Field label="Drivetrain"><Input name="drivetrain" defaultValue={car.drivetrain ?? ''} /></Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Engine"><Input name="engine" defaultValue={car.engine ?? ''} /></Field>
        <Field label="Location (LGA)"><Input name="location_area" defaultValue={car.location_area ?? ''} /></Field>
      </div>

      <Field label="Description">
        <textarea
          name="description"
          rows={4}
          defaultValue={car.description ?? ''}
          className="w-full border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="VIN (admin only)"><Input name="vin" defaultValue={car.vin ?? ''} /></Field>
        <Field label="Registration plate (admin only)">
          <Input name="registration_plate" defaultValue={car.registration_plate ?? ''} />
        </Field>
      </div>

      <Field label="Acquisition notes (admin only)">
        <textarea
          name="acquisition_notes"
          rows={2}
          defaultValue={car.acquisition_notes ?? ''}
          className="w-full border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink"
        />
      </Field>

      <Field label="Status">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Car['status'])}
          className="border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink"
        >
          <option value="draft">Draft</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold — brokered by me</option>
          <option value="withdrawn">Withdrawn — gone elsewhere / delisted</option>
        </select>
      </Field>

      {isTerminal && (
        <Field label="Archive reason">
          <Input
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
            placeholder={status === 'sold' ? 'e.g. sold to walk-in buyer' : 'e.g. sold at source before enquiry'}
          />
        </Field>
      )}

      {error && <p className="font-body text-sm text-signal-red">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-signal-red text-white font-body font-semibold text-sm px-6 py-3 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Save changes'}
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
