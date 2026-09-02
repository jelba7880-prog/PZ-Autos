// Mirrors public_cars_view's column list exactly. If you add a column to
// that view, add it here too (or better, regenerate types from the DB).
export interface PublicCar {
  id: string
  slug: string
  make: string
  model: string
  year: number
  trim: string | null
  body_type: string | null
  transmission: string | null
  fuel_type: string | null
  mileage_km: number | null
  exterior_colour: string | null
  interior_colour: string | null
  engine: string | null
  drivetrain: string | null
  condition: string | null
  description: string | null
  key_features: string[] | null
  location_area: string | null
  asking_price_ngn: string // numeric columns arrive as strings over PostgREST
  status: 'available' | 'reserved' | 'sold'
  status_changed_at: string
  last_verified_at: string
  is_featured: boolean
  featured_order: number | null
  created_at: string
  updated_at: string
}

export interface PublicCarImage {
  id: string
  car_id: string
  storage_path: string
  alt_text: string | null
  is_cover: boolean
  sort_order: number
}

export interface PublicCarWithImages extends PublicCar {
  images: PublicCarImage[]
}

export interface PublicCarCardData extends PublicCar {
  coverImageUrl: string | null
}
