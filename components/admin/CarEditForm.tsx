'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ImageUploader, type PendingImage } from './ImageUploader'
import { getCarImagePublicUrl } from '@/lib/images'
import { Combobox } from '@/components/ui/combobox'
import { ConstrainedSelect } from '@/components/ui/constrained-select'
import {
  BODY_TYPES,
  CAR_MAKES,
  DRIVETRAINS,
  ENGINE_LAYOUTS,
  FUEL_TYPES,
  TRANSMISSIONS,
  carFormSchema,
  getModelsForMake,
  getYearOptions,
} from '@/lib/carOptions'
import type { Car, CarImage } from '@/lib/supabase/types'

interface CarEditFormProps {
  car: Car
  images: CarImage[]
}

const YEAR_OPTIONS = getYearOptions().map(String)

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
  const [make, setMake] = useState(car.make)
  const [model, setModel] = useState(car.model)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)

    const parsed = carFormSchema.safeParse({
      make: form.get('make'),
      model: form.get('model'),
      year: form.get('year'),
      trim: form.get('trim'),
      body_type: form.get('body_type'),
      transmission: form.get('transmission'),
      fuel_type: form.get('fuel_type'),
      mileage_km: form.get('mileage_km') || undefined,
      exterior_colour: form.get('exterior_colour'),
      interior_colour: form.get('interior_colour'),
      engine: form.get('engine'),
      drivetrain: form.get('drivetrain'),
      condition: form.get('condition'),
      description: form.get('description'),
      location_area: form.get('location_area'),
      vin: form.get('vin'),
      cost_price_ngn: form.get('cost_price_ngn') || undefined,
      asking_price_ngn: form.get('asking_price_ngn'),
      acquisition_notes: form.get('acquisition_notes'),
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the fields and try again.')
      return
    }

    setSaving(true)
    const values = parsed.data
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('cars')
      .update({
        make: values.make,
        model: values.model,
        year: values.year,
        trim: values.trim || null,
        body_type: values.body_type || null,
        transmission: values.transmission || null,
        fuel_type: values.fuel_type || null,
        mileage_km: values.mileage_km ?? null,
        exterior_colour: values.exterior_colour || null,
        interior_colour: values.interior_colour || null,
        engine: values.engine || null,
        drivetrain: values.drivetrain || null,
        condition: values.condition || null,
        description: values.description || null,
        location_area: values.location_area || null,
        vin: values.vin || null,
        cost_price_ngn: values.cost_price_ngn ?? null,
        asking_price_ngn: values.asking_price_ngn,
        status,
        archive_reason: status === 'sold' || status === 'withdrawn' ? archiveReason || null : null,
        acquisition_notes: values.acquisition_notes || null,
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
        <Field label="Make">
          <Combobox
            name="make"
            value={make}
            onChange={(v) => {
              setMake(v)
              setModel('')
            }}
            options={[...CAR_MAKES]}
            placeholder="Select or type a make"
          />
        </Field>
        <Field label="Model">
          <Combobox
            name="model"
            value={model}
            onChange={setModel}
            options={getModelsForMake(make)}
            placeholder={make ? 'Select or type a model' : 'Pick a make first'}
          />
        </Field>
        <Field label="Year">
          <ConstrainedSelect name="year" defaultValue={String(car.year)} options={YEAR_OPTIONS} placeholder="Select year" />
        </Field>
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
        <Field label="Body type">
          <ConstrainedSelect name="body_type" defaultValue={car.body_type} options={BODY_TYPES} placeholder="Select body type" />
        </Field>
        <Field label="Condition"><Input name="condition" defaultValue={car.condition ?? ''} /></Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Transmission">
          <ConstrainedSelect name="transmission" defaultValue={car.transmission} options={TRANSMISSIONS} placeholder="Select transmission" />
        </Field>
        <Field label="Fuel type">
          <ConstrainedSelect name="fuel_type" defaultValue={car.fuel_type} options={FUEL_TYPES} placeholder="Select fuel type" />
        </Field>
        <Field label="Mileage (km)"><Input name="mileage_km" type="number" defaultValue={car.mileage_km ?? ''} /></Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Exterior colour"><Input name="exterior_colour" defaultValue={car.exterior_colour ?? ''} /></Field>
        <Field label="Interior colour"><Input name="interior_colour" defaultValue={car.interior_colour ?? ''} /></Field>
        <Field label="Drivetrain">
          <ConstrainedSelect name="drivetrain" defaultValue={car.drivetrain} options={DRIVETRAINS} placeholder="Select drivetrain" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Engine layout">
          <ConstrainedSelect name="engine" defaultValue={car.engine} options={ENGINE_LAYOUTS} placeholder="Select engine layout" />
        </Field>
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

      <Field label="VIN (admin only)"><Input name="vin" defaultValue={car.vin ?? ''} /></Field>

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
