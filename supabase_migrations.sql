-- ============================================================
-- Stayo — run these in Supabase SQL editor
-- Safe to re-run (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- ============================================================

-- 1. Add columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_name TEXT;

-- 2. Add columns to listings table
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
  ADD COLUMN IF NOT EXISTS bathrooms INTEGER,
  ADD COLUMN IF NOT EXISTS car_seats INTEGER,
  ADD COLUMN IF NOT EXISTS car_transmission TEXT;

-- 2. Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  booking_id      UUID REFERENCES bookings(id) ON DELETE SET NULL,
  reward_status   TEXT NOT NULL DEFAULT 'pending',  -- pending | paid
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Availability table (if not already created)
CREATE TABLE IF NOT EXISTS availability (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  reason      TEXT NOT NULL DEFAULT 'manual',   -- manual | booked
  booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, date)
);

-- 4. AI recommendations log (optional — used by /api/recommendations)
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  context     JSONB,
  result      JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Promo codes table (if not already created)
CREATE TABLE IF NOT EXISTS promo_codes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT NOT NULL UNIQUE,
  discount_type  TEXT NOT NULL DEFAULT 'percentage',   -- percentage | fixed
  discount_value NUMERIC NOT NULL,
  max_uses       INTEGER,
  uses_count     INTEGER NOT NULL DEFAULT 0,
  expires_at     TIMESTAMPTZ,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Payouts table (if not already created)
CREATE TABLE IF NOT EXISTS payouts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  host_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount      NUMERIC NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',   -- pending | paid
  paid_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Make sure bookings has the needed columns
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS guest_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS total_amount   NUMERIC,
  ADD COLUMN IF NOT EXISTS commission_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS payout_amount  NUMERIC,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS promo_code_id  UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paystack_reference TEXT;

-- If your bookings table uses guest_id instead of user_id, sync them:
-- UPDATE bookings SET user_id = guest_id WHERE user_id IS NULL;

-- 8. RLS policies — enable RLS and add basic policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read availability" ON availability FOR SELECT USING (true);
CREATE POLICY "Hosts can manage their listing availability" ON availability
  FOR ALL USING (
    listing_id IN (
      SELECT id FROM listings WHERE host_id = auth.uid()
    )
  );
CREATE POLICY "Admins can manage all availability" ON availability
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );
