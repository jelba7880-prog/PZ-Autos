'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SupplierPicker } from './SupplierPicker'
import { ImageUploader, type PendingImage } from './ImageUploader'
import { MakeModelFields } from './MakeModelFields'
import { ConstrainedSelect } from './ConstrainedSelect'
import { Field } from './FormField'
import { createCarWithImages } from '@/lib/supabase/storage'
import { generateCarSlug } from '@/lib/slugify'
import { buildCarFormSchema, formatCarFormErrors } from '@/lib/carFormSchema'
import { BODY_TYPES, DEFAULT_FUEL_TYPE, DRIVETRAINS, ENGINE_LAYOUTS, FUEL_TYPES, TRANSMISSIONS, getYearOptions } from '@/lib/carOptions'
import type { Supplier } from '@/lib/supabase/types'

interface CarFormProps {
  suppliers: Pick<Supplier, 'id' | 'name' | 'supplier_type'>[]
}

const YEAR_OPTIONS = getYearOptions()

export function CarForm({ suppliers: initialSuppliers }: CarFormProps) {
  const router = useRouter()
  const [folderId] = useState(() => crypto.randomUUID())
  const [suppliers, setSuppliers] = useState(initialSuppliers)
  const [supplierId, setSupplierId] = useState('')
  const [images, setImages] = useState<PendingImage[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [transmission, setTransmission] = useState('')
  const [fuelType, setFuelType] = useState<string>(DEFAULT_FUEL_TYPE)
  const [drivetrain, setDrivetrain] = useState('')
  const [engineLayout, setEngineLayout] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)
    const askingPrice = Number(form.get('asking_price_ngn'))
    const costPriceRaw = form.get('cost_price_ngn')
    const status = String(form.get('status') ?? 'draft') as 'draft' | 'available' | 'reserved'
    const keyFeaturesRaw = String(form.get('key_features') ?? '')

    if (!supplierId) {
      setError('Select or create a supplier')
      return
    }

    const parsed = buildCarFormSchema().safeParse({
      make,
      model,
      year,
      body_type: bodyType,
      transmission,
      fuel_type: fuelType,
      drivetrain,
      engine_layout: engineLayout,
    })
    if (!parsed.success) {
      setError(formatCarFormErrors(parsed.error))
      return
    }
    if (!askingPrice) {
      setError('Asking price is required')
      return
    }
    if (images.length === 0) {
      setError('Add at least one photo')
      return
    }

    setSubmitting(true)

    try {
      const slug = generateCarSlug(parsed.data.year, parsed.data.make, parsed.data.model)

      await createCarWithImages(
        folderId,
        {
          slug,
          supplier_id: supplierId,
          make: parsed.data.make,
          model: parsed.data.model,
          year: parsed.data.year,
          trim: (form.get('trim') as string) || null,
          body_type: parsed.data.body_type,
          transmission: parsed.data.transmission,
          fuel_type: parsed.data.fuel_type,
          mileage_km: form.get('mileage_km') ? Number(form.get('mileage_km')) : null,
          exterior_colour: (form.get('exterior_colour') as string) || null,
          interior_colour: (form.get('interior_colour') as string) || null,
          engine_layout: parsed.data.engine_layout,
          drivetrain: parsed.data.drivetrain,
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
        <MakeModelFields make={make} model={model} onMakeChange={setMake} onModelChange={setModel} />
        <Field label="Year">
          <select
            name="year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            className="w-full border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink"
          >
            <option value="">Select year…</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Asking price (₦)"><Input name="asking_price_ngn" type="number" min={1} required /></Field>
        <Field label="Cost price (₦, admin only)"><Input name="cost_price_ngn" type="number" min={0} /></Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Trim"><Input name="trim" /></Field>
        <Field label="Body type">
          <ConstrainedSelect
            name="body_type"
            options={BODY_TYPES}
            value={bodyType}
            onChange={setBodyType}
            placeholder="Select body type…"
          />
        </Field>
        <Field label="Condition"><Input name="condition" /></Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Transmission">
          <ConstrainedSelect
            name="transmission"
            options={TRANSMISSIONS}
            value={transmission}
            onChange={setTransmission}
            placeholder="Select transmission…"
          />
        </Field>
        <Field label="Fuel type">
          <ConstrainedSelect
            name="fuel_type"
            options={FUEL_TYPES}
            value={fuelType}
            onChange={setFuelType}
            placeholder="Select fuel type…"
          />
        </Field>
        <Field label="Mileage (km)"><Input name="mileage_km" type="number" min={0} /></Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Exterior colour"><Input name="exterior_colour" /></Field>
        <Field label="Interior colour"><Input name="interior_colour" /></Field>
        <Field label="Drivetrain">
          <ConstrainedSelect
            name="drivetrain"
            options={DRIVETRAINS}
            value={drivetrain}
            onChange={setDrivetrain}
            placeholder="Select drivetrain…"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Engine layout">
          <ConstrainedSelect
            name="engine_layout"
            options={ENGINE_LAYOUTS}
            value={engineLayout}
            onChange={setEngineLayout}
            placeholder="Select engine layout…"
          />
        </Field>
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

      <Field label="VIN (admin only)"><Input name="vin" /></Field>

      <details className="rounded-lg border border-hairline px-3 py-2">
        <summary className="font-body text-xs font-semibold uppercase tracking-wide text-text-muted cursor-pointer">
          Registration plate (optional, admin only)
        </summary>
        <div className="mt-2">
          <Input name="registration_plate" />
        </div>
      </details>

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

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink"
    />
  )
}
