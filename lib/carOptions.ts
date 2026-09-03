// Single source of truth for the admin car form's constrained fields.
// Both CarForm and CarEditForm import from here so the option sets can
// never drift apart between add and edit.
//
// These are UX constraints only — the `cars` table has no CHECK
// constraint on any of these text columns (see the Phase 1 RPC report),
// so legacy free-text values already in the database (e.g. body_type
// "SUV/Crossover") remain valid rows and must keep loading/saving through
// the edit form without being rejected or silently cleared. The Zod
// schema below reflects that: it validates presence/shape, not enum
// membership, for the fields exposed as dropdowns.

import { z } from 'zod'

export const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'] as const
export const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'] as const
export const DRIVETRAINS = ['FWD', 'RWD', 'AWD', '4WD'] as const
export const ENGINE_LAYOUTS = ['I3', 'I4', 'I5', 'I6', 'V6', 'V8', 'V10', 'V12', 'Electric'] as const
export const BODY_TYPES = ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Truck', 'Bus'] as const

export type FuelType = (typeof FUEL_TYPES)[number]
export type Transmission = (typeof TRANSMISSIONS)[number]
export type Drivetrain = (typeof DRIVETRAINS)[number]
export type EngineLayout = (typeof ENGINE_LAYOUTS)[number]
export type BodyType = (typeof BODY_TYPES)[number]

export const DEFAULT_FUEL_TYPE: FuelType = 'Petrol'

// Earliest year the DB's own CHECK constraint allows
// (`year between 1980 and extract(year from now()) + 1`) — kept in sync
// with supabase/migrations/20260902000000_baseline_schema.sql.
export const MIN_CAR_YEAR = 1980

export function getYearOptions(currentYear = new Date().getFullYear()): number[] {
  const maxYear = currentYear + 1
  const years: number[] = []
  for (let year = maxYear; year >= MIN_CAR_YEAR; year--) {
    years.push(year)
  }
  return years
}

// Starter list of common Nigerian-market makes for the Make/Model
// combobox. Inventory is broker-sourced and not limited to this list —
// both Make and Model accept free entry for anything not shown here.
export const CAR_MAKES = [
  'Toyota',
  'Lexus',
  'Honda',
  'Mercedes-Benz',
  'BMW',
  'Land Rover',
  'Range Rover',
  'Volkswagen',
  'Nissan',
  'Hyundai',
  'Kia',
  'Ford',
  'Peugeot',
  'Mazda',
  'Mitsubishi',
  'Infiniti',
  'Acura',
  'Audi',
  'Volvo',
  'Jeep',
  'Chevrolet',
] as const

export const MODELS_BY_MAKE: Record<string, string[]> = {
  Toyota: ['Camry', 'Corolla', 'Hilux', 'Land Cruiser', 'Land Cruiser Prado', 'RAV4', 'Highlander', 'Sienna', 'Venza', 'Avalon', 'Tacoma'],
  Lexus: ['RX', 'ES', 'GX', 'LX', 'IS', 'NX', 'LS'],
  Honda: ['Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'G-Class', 'A-Class'],
  BMW: ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X6'],
  'Land Rover': ['Discovery', 'Discovery Sport', 'Defender', 'Freelander'],
  'Range Rover': ['Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar'],
  Volkswagen: ['Golf', 'Passat', 'Tiguan', 'Jetta', 'Touareg'],
  Nissan: ['Altima', 'Maxima', 'Murano', 'Pathfinder', 'Patrol', 'Sentra', 'Rogue'],
  Hyundai: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent'],
  Kia: ['Optima', 'Sportage', 'Sorento', 'Rio', 'Cerato'],
  Ford: ['Explorer', 'Edge', 'F-150', 'Focus', 'Escape'],
  Peugeot: ['3008', '5008', '508', '308'],
  Mazda: ['Mazda3', 'Mazda6', 'CX-5', 'CX-9'],
  Mitsubishi: ['Outlander', 'Pajero', 'Lancer', 'ASX'],
  Infiniti: ['Q50', 'QX60', 'QX80'],
  Acura: ['MDX', 'RDX', 'TLX'],
  Audi: ['A4', 'A6', 'Q5', 'Q7'],
  Volvo: ['XC60', 'XC90', 'S60'],
  Jeep: ['Grand Cherokee', 'Cherokee', 'Wrangler', 'Compass'],
  Chevrolet: ['Malibu', 'Tahoe', 'Equinox'],
}

export function getModelsForMake(make: string): string[] {
  return MODELS_BY_MAKE[make] ?? []
}

// Fields left as z.string() (rather than z.enum(...)) are the dropdown
// fields above — the dropdown constrains what a user picks going forward,
// but a legacy free-text value already stored on a car must still parse
// and save unchanged when the rest of the form is edited.
export const carFormSchema = z.object({
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  year: z.coerce
    .number()
    .int('Year must be a whole number')
    .min(MIN_CAR_YEAR, `Year must be ${MIN_CAR_YEAR} or later`)
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  trim: z.string().trim().optional(),
  body_type: z.string().trim().optional(),
  transmission: z.string().trim().optional(),
  fuel_type: z.string().trim().optional(),
  mileage_km: z.coerce.number().int().min(0).optional(),
  exterior_colour: z.string().trim().optional(),
  interior_colour: z.string().trim().optional(),
  engine: z.string().trim().optional(),
  drivetrain: z.string().trim().optional(),
  condition: z.string().trim().optional(),
  description: z.string().trim().optional(),
  key_features: z.string().trim().optional(),
  location_area: z.string().trim().optional(),
  vin: z.string().trim().optional(),
  cost_price_ngn: z.coerce.number().min(0).optional(),
  asking_price_ngn: z.coerce.number().min(1, 'Asking price is required'),
  status: z.enum(['draft', 'available', 'reserved']).optional(),
  acquisition_notes: z.string().trim().optional(),
})

export type CarFormValues = z.infer<typeof carFormSchema>
