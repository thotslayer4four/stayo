'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Listing } from '@/types'

interface Host {
  id: string
  full_name: string | null
  email?: string
}

interface ListingFormProps {
  hosts: Host[]
  initialData?: Listing
  defaultHostId?: string
  submitEndpoint?: string
  successRedirect?: string
  hideHostSelector?: boolean
}

const ABUJA_AREAS = ['Wuse', 'Maitama', 'Garki', 'Asokoro', 'Guzape', 'Jabi', 'Central Area', 'Utako', 'Gudu', 'Kubwa']
const COMMON_AMENITIES = ['WiFi', 'AC', 'Generator', 'Hot water', 'Kitchen', 'Parking', 'Security', 'Pool', 'Gym', 'DSTV']

export default function ListingForm({
  hosts,
  initialData,
  defaultHostId,
  submitEndpoint,
  successRedirect,
  hideHostSelector = false,
}: ListingFormProps) {
  const router = useRouter()
  const isEdit = !!initialData

  const [type, setType] = useState<'shortlet' | 'car'>(initialData?.type ?? 'shortlet')
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [city, setCity] = useState(initialData?.city ?? '')
  const [address, setAddress] = useState(initialData?.address ?? '')
  const [location, setLocation] = useState(initialData?.location ?? '')
  const [hostId, setHostId] = useState(initialData?.host_id ?? defaultHostId ?? (hosts[0]?.id ?? ''))
  const [pricePerNight, setPricePerNight] = useState(initialData?.price_per_night?.toString() ?? '')
  const [pricePerDay, setPricePerDay] = useState(initialData?.price_per_day?.toString() ?? '')
  const [maxGuests, setMaxGuests] = useState(initialData?.max_guests?.toString() ?? '')
  const [bedrooms, setBedrooms] = useState(initialData?.bedrooms?.toString() ?? '')
  const [bathrooms, setBathrooms] = useState(initialData?.bathrooms?.toString() ?? '')
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities ?? [])
  const [amenityInput, setAmenityInput] = useState('')
  const [carMake, setCarMake] = useState(initialData?.car_make ?? '')
  const [carModel, setCarModel] = useState(initialData?.car_model ?? '')
  const [carYear, setCarYear] = useState(initialData?.car_year?.toString() ?? '')
  const [carSeats, setCarSeats] = useState(initialData?.car_seats?.toString() ?? '')
  const [carTransmission, setCarTransmission] = useState(initialData?.car_transmission ?? '')
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images ?? [])
  const [imageInput, setImageInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addAmenity(value: string) {
    const trimmed = value.trim()
    if (trimmed && !amenities.includes(trimmed)) setAmenities([...amenities, trimmed])
    setAmenityInput('')
  }

  function addImage() {
    const trimmed = imageInput.trim()
    if (trimmed && !imageUrls.includes(trimmed)) setImageUrls([...imageUrls, trimmed])
    setImageInput('')
  }

  const cancelHref = successRedirect ?? '/admin/listings'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const body = {
      host_id: hostId,
      type,
      title,
      description,
      city,
      address,
      location,
      images: imageUrls,
      ...(type === 'shortlet'
        ? {
            price_per_night: pricePerNight ? Number(pricePerNight) : null,
            max_guests: maxGuests ? Number(maxGuests) : null,
            bedrooms: bedrooms ? Number(bedrooms) : null,
            bathrooms: bathrooms ? Number(bathrooms) : null,
            amenities,
          }
        : {
            price_per_night: null,
            price_per_day: pricePerDay ? Number(pricePerDay) : null,
            car_make: carMake,
            car_model: carModel,
            car_year: carYear ? Number(carYear) : null,
            car_seats: carSeats ? Number(carSeats) : null,
            car_transmission: carTransmission || null,
          }),
    }

    const url = submitEndpoint ?? (isEdit ? `/api/admin/listings/${initialData!.id}` : '/api/admin/listings')
    const method = isEdit ? 'PATCH' : 'POST'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      router.push(cancelHref)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent'
  const labelClass = 'block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type toggle */}
      <div>
        <p className={labelClass}>Type</p>
        <div className="flex gap-2">
          {(['shortlet', 'car'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                type === t ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Host selector (admin only) */}
      {!hideHostSelector && (
        <div>
          <label className={labelClass}>Host</label>
          <select
            value={hostId}
            onChange={(e) => setHostId(e.target.value)}
            className={inputClass}
            required
          >
            {hosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.full_name ?? h.email ?? h.id}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Title */}
      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === 'shortlet' ? 'Cosy 2-bed apartment in Maitama' : 'Toyota Camry 2022'}
          className={inputClass}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="Describe the property or car…"
        />
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Area</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} required>
            <option value="">Select area</option>
            {ABUJA_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Landmark / Zone</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Zone 4"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Full address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="12 Aminu Kano Crescent, Wuse 2"
          className={inputClass}
          required
        />
      </div>

      {/* Type-specific fields */}
      {type === 'shortlet' ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Price per night (₦)</label>
              <input
                type="number"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                placeholder="50000"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Max guests</label>
              <input
                type="number"
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                placeholder="4"
                min="1"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Bedrooms</label>
              <input
                type="number"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="2"
                min="0"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Bathrooms</label>
              <input
                type="number"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                placeholder="1"
                min="0"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Amenities</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    if (amenities.includes(a)) setAmenities(amenities.filter((x) => x !== a))
                    else setAmenities([...amenities, a])
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    amenities.includes(a) ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(amenityInput) } }}
                placeholder="Add custom amenity…"
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={() => addAmenity(amenityInput)}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 text-sm font-medium hover:bg-zinc-200 transition-colors"
              >
                Add
              </button>
            </div>
            {amenities.filter((a) => !COMMON_AMENITIES.includes(a)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {amenities.filter((a) => !COMMON_AMENITIES.includes(a)).map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 text-xs bg-zinc-900 text-white px-3 py-1 rounded-full">
                    {a}
                    <button type="button" onClick={() => setAmenities(amenities.filter((x) => x !== a))} className="hover:text-zinc-300">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Make</label>
              <input type="text" value={carMake} onChange={(e) => setCarMake(e.target.value)} placeholder="Toyota" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Model</label>
              <input type="text" value={carModel} onChange={(e) => setCarModel(e.target.value)} placeholder="Camry" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Year</label>
              <input type="number" value={carYear} onChange={(e) => setCarYear(e.target.value)} placeholder="2022" min="2000" max="2030" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Price per day (₦)</label>
              <input type="number" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} placeholder="20000" className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Seats</label>
              <input type="number" value={carSeats} onChange={(e) => setCarSeats(e.target.value)} placeholder="5" min="1" max="20" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Transmission</label>
            <select value={carTransmission} onChange={(e) => setCarTransmission(e.target.value)} className={inputClass}>
              <option value="">Select</option>
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>
        </>
      )}

      {/* Images */}
      <div>
        <label className={labelClass}>Images (paste URLs)</label>
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
            placeholder="https://…"
            className={`${inputClass} flex-1`}
          />
          <button type="button" onClick={addImage} className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 text-sm font-medium hover:bg-zinc-200 transition-colors">
            Add
          </button>
        </div>
        {imageUrls.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border border-zinc-200 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}
                  className="absolute inset-0 bg-black/50 text-white text-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors disabled:opacity-40"
        >
          {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Submit listing'}
        </button>
        <button
          type="button"
          onClick={() => router.push(cancelHref)}
          className="px-5 py-3.5 rounded-xl border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
