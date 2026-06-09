export type UserRole = 'guest' | 'host' | 'admin'
export type ListingType = 'shortlet' | 'car'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

export interface DbUser {
  id: string
  email: string
  phone: string | null
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  auth_provider: string
  referral_code: string | null
  referred_by: string | null
  created_at: string
}

export interface Listing {
  id: string
  host_id: string
  type: ListingType
  title: string
  description: string
  location: string
  address: string
  city: string
  price_per_night: number | null
  price_per_day: number | null
  images: string[]
  amenities: string[]
  max_guests: number | null
  bedrooms: number | null
  bathrooms: number | null
  car_make: string | null
  car_model: string | null
  car_year: number | null
  car_seats: number | null
  car_transmission: string | null
  price_per_hour: number | null
  is_active: boolean
  is_approved: boolean
  created_at: string
}

export interface Booking {
  id: string
  guest_id: string
  status: BookingStatus
  total_amount: number
  commission_amount: number
  payout_amount: number
  payment_status: PaymentStatus
  paystack_reference: string | null
  promo_code_id: string | null
  discount_amount: number
  created_at: string
}

export interface BookingItem {
  id: string
  booking_id: string
  listing_id: string
  type: ListingType
  check_in: string
  check_out: string
  price_per_unit: number
  nights_or_days: number
  subtotal: number
}
