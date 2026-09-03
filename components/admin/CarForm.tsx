'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SupplierPicker } from './SupplierPicker'
import { ImageUploader, type PendingImage } from './ImageUploader'
import { Combobox } from '@/components/ui/combobox'
import { ConstrainedSelect } from '@/components/ui/constrained-select'
import { createCarWithImages } from '@/lib/supabase/storage'
import { generateCarSlug } from '@/lib/slugify'
import {
  BODY_TYPES,
  CAR_MAKES,
  DEFAULT_FUEL_TYPE,
  DRIVETRAINS,
  ENGINE_LAYOUTS,
  FUEL_TYPES,
  TRANSMISSIONS,
  carFormSchema,
  getModelsForMake,
  getYearOptions,
} from '@/lib/carOptions'
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
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      key_features: form.get('key_features'),
      location_area: form.get('location_area'),
      vin: form.get('vin'),
      cost_price_ngn: form.get('cost_price_ngn') || undefined,
      asking_price_ngn: form.get('asking_price_ngn'),
      status: form.get('status') || undefined,
      acquisition_notes: form.get('acquisition_notes'),
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the fields and try again.')
      return
    }

    if (!supplierId) {
      setError('Select or create a supplier')
      return
    }
    if (images.length === 0) {
      setError('Add at least one photo')
      return
    }

    const values = parsed.data
    setSubmitting(true)

    try {
      const slug = generateCarSlug(values.year, values.make, values.model)
      const keyFeatures = values.key_features
        ? values.key_features.split(',').map((s) => s.trim()).filter(Boolean)
        : null

      await createCarWithImages(
        folderId,
        {
          slug,
          supplier_id: supplierId,
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
          key_features: keyFeatures,
          location_area: values.location_area || null,
          vin: values.vin || null,
          cost_price_ngn: values.cost_price_ngn ?? null,
          asking_price_ngn: values.asking_price_ngn,
          status: values.status ?? 'draft',
          acquisition_notes: values.acquisition_notes || null,
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
          <select name="year" defaultValue="" required className="w-full border border-hairline rounded-lg px-3 py-2 font-body text-sm text-ink">
            <option value="" disabled>Select year</option>
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>{y}</option>
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
          <ConstrainedSelect name="body_type" options={BODY_TYPES} placeholder="Select body type" />
        </Field>
        <Field label="Condition"><Input name="condition" /></Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Transmission">
          <ConstrainedSelect name="transmission" options={TRANSMISSIONS} placeholder="Select transmission" />
        </Field>
        <Field label="Fuel type">
          <ConstrainedSelect name="fuel_type" defaultValue={DEFAULT_FUEL_TYPE} options={FUEL_TYPES} placeholder="Select fuel type" />
        </Field>
        <Field label="Mileage (km)"><Input name="mileage_km" type="number" min={0} /></Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Exterior colour"><Input name="exterior_colour" /></Field>
        <Field label="Interior colour"><Input name="interior_colour" /></Field>
        <Field label="Drivetrain">
          <ConstrainedSelect name="drivetrain" options={DRIVETRAINS} placeholder="Select drivetrain" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Engine layout">
          <ConstrainedSelect name="engine" options={ENGINE_LAYOUTS} placeholder="Select engine layout" />
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
