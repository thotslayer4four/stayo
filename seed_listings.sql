-- ============================================================
-- Stayo — Listings Seed Data
-- images  = text[]   → use ARRAY['url','url']
-- amenities = jsonb  → use '["item","item"]'::jsonb
-- ============================================================

DO $$
DECLARE
  hid UUID;
BEGIN
  SELECT id INTO hid FROM users WHERE role IN ('host', 'admin') ORDER BY created_at LIMIT 1;
  IF hid IS NULL THEN
    SELECT id INTO hid FROM users ORDER BY created_at LIMIT 1;
  END IF;
  IF hid IS NULL THEN
    RAISE EXCEPTION 'No users found. Sign up first, then run this seed.';
  END IF;

  -- SHORTLETS

  INSERT INTO listings (host_id, type, title, description, location, address, city, price_per_night, price_per_day, images, amenities, max_guests, bedrooms, bathrooms, is_active, is_approved)
  VALUES

  (hid,'shortlet','Luxury 3-Bed Apartment in Maitama','A beautifully furnished three-bedroom apartment in the heart of Maitama. High ceilings, Italian marble floors, private balcony with city views. Walking distance to embassies, top restaurants, and Transcorp Hilton.','Maitama','14 Maitama Close, off Udi Street','Abuja',85000,NULL,
  ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Smart TV","Kitchen","Washing Machine","Security","Parking"]'::jsonb,
  6,3,3,true,true),

  (hid,'shortlet','Executive 4-Bed Duplex in Asokoro','Sprawling executive duplex in the exclusive Asokoro district. Private compound with manicured gardens, pool terrace, and 24-hour security. Fully fitted kitchen with premium appliances.','Asokoro','7 Gimbiya Street, Asokoro','Abuja',120000,NULL,
  ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format&fit=crop'],
  '["Pool","WiFi","Air Conditioning","Generator","Smart TV","Kitchen","Washing Machine","Security","Garden","Parking"]'::jsonb,
  8,4,4,true,true),

  (hid,'shortlet','Modern 2-Bed Apartment in Garki','Smartly designed two-bedroom in Garki II, minutes from Area 3 shops and government offices. Contemporary interiors, full kitchen, fast Wi-Fi.','Garki','22 Enugu Crescent, Garki II','Abuja',45000,NULL,
  ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Smart TV","Kitchen","Security"]'::jsonb,
  4,2,2,true,true),

  (hid,'shortlet','Upscale 2-Bed Apartment in Wuse 2','Stylish two-bedroom in Wuse 2 — steps from Banex Plaza, Transcorp, and the best restaurants in the city. Sleek interiors, fibre Wi-Fi, uninterrupted power.','Wuse 2','5B Aminu Kano Crescent, Wuse 2','Abuja',65000,NULL,
  ARRAY['https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Smart TV","Kitchen","Security","Parking"]'::jsonb,
  4,2,2,true,true),

  (hid,'shortlet','Spacious 3-Bed Apartment in Gwarimpa','Large family-friendly apartment in Gwarimpa estate. All rooms ensuite, open-plan living, and private car park. Quiet street with easy expressway access.','Gwarimpa','18 3rd Avenue, Gwarimpa Estate','Abuja',55000,NULL,
  ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1595526051245-4506e0005bd0?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Smart TV","Kitchen","Washing Machine","Parking"]'::jsonb,
  6,3,3,true,true),

  (hid,'shortlet','Lakeside 2-Bed Apartment in Jabi','Bright two-bedroom with partial Jabi Lake views. Modern kitchen, cosy bedrooms with blackout blinds, shared rooftop terrace. Minutes from Jabi Lake Mall.','Jabi','11 Lake View Drive, Jabi','Abuja',70000,NULL,
  ARRAY['https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1574180045827-681f8a1a9622?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Smart TV","Kitchen","Security","Parking","Lake View"]'::jsonb,
  4,2,2,true,true),

  (hid,'shortlet','Contemporary 1-Bed Studio in Utako','Compact but beautifully finished studio in Utako for solo travellers and couples. Queen bed, work desk, kitchenette, high-speed Wi-Fi, and CCTV security.','Utako','9 Calabar Street, Utako','Abuja',38000,NULL,
  ARRAY['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Smart TV","Kitchenette","Security"]'::jsonb,
  2,1,1,true,true),

  (hid,'shortlet','Elegant 4-Bed Family Home in Life Camp','Spacious detached home in serene Life Camp for families or large groups. Large sitting room, dining area, outdoor patio. All bedrooms ensuite with premium linen.','Life Camp','3 Life Camp Close, Life Camp','Abuja',95000,NULL,
  ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Smart TV","Kitchen","Washing Machine","Parking","Garden","Security"]'::jsonb,
  8,4,4,true,true),

  (hid,'shortlet','Cozy 2-Bed Apartment in Lugbe','Neat two-bedroom near Nnamdi Azikiwe International Airport. Great for transit guests, layovers, or budget stays. Stable power and Wi-Fi.','Lugbe','45 Airport Road, Lugbe','Abuja',30000,NULL,
  ARRAY['https://images.unsplash.com/photo-1545324418-cc1a3fa12c98?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Kitchen","Security","Parking"]'::jsonb,
  4,2,1,true,true),

  (hid,'shortlet','Penthouse 3-Bed Suite in Kado','Top-floor penthouse in Kado with panoramic views of the Abuja skyline and Aso Rock. Floor-to-ceiling windows, private terrace, premium smart-home features.','Kado','1 Penthouse Towers, Kado Estate','Abuja',110000,NULL,
  ARRAY['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Smart TV","Kitchen","Washing Machine","Security","Parking","Terrace","City View"]'::jsonb,
  6,3,3,true,true),

  (hid,'shortlet','Budget Studio in Durumi','Clean affordable studio in Durumi District 1. Great for solo travellers, NYSC corps members, or budget stays. Reliable power, proximity to Area 1 mall.','Durumi','12 Durumi Crescent, District 1','Abuja',25000,NULL,
  ARRAY['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1545324418-cc1a3fa12c98?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Kitchen","Security"]'::jsonb,
  2,1,1,true,true),

  (hid,'shortlet','Hilltop 3-Bed Villa in Katampe','Exclusive villa in Katampe Extension with sweeping city views. Wraparound terrace, private garden, full kitchen. Gated community with roving security.','Katampe','5 Hilltop Villa Road, Katampe Ext.','Abuja',90000,NULL,
  ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Smart TV","Kitchen","Garden","Parking","Security","City View"]'::jsonb,
  6,3,3,true,true),

  (hid,'shortlet','Business Suite in the CBD','Premium serviced apartment in Abuja CBD. Walk to NASS and federal ministries. Sleek corporate aesthetic, king bed, blackout curtains, 24-hour generator.','Central Business District','20 Shehu Shagari Way, CBD','Abuja',75000,NULL,
  ARRAY['https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Smart TV","Kitchenette","Security","Parking"]'::jsonb,
  2,1,1,true,true),

  (hid,'shortlet','Stylish 2-Bed Apartment in Gudu','Modern two-bedroom in the developing Gudu district. Contemporary furnishings, warm colour palette, fully kitted kitchen. Close to Gudu market, short drive to airport.','Gudu','8 Gudu District Street, Gudu','Abuja',50000,NULL,
  ARRAY['https://images.unsplash.com/photo-1595526051245-4506e0005bd0?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1574180045827-681f8a1a9622?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Smart TV","Kitchen","Security","Parking"]'::jsonb,
  4,2,2,true,true),

  (hid,'shortlet','Affordable 3-Bed Home in Kubwa','Spacious three-bedroom bungalow in Kubwa. Large compound with parking, small garden, relaxed residential feel. Ideal for families or long-stay guests.','Kubwa','33 Phase 2 Road, Kubwa','Abuja',28000,NULL,
  ARRAY['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1545324418-cc1a3fa12c98?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format&fit=crop'],
  '["WiFi","Air Conditioning","Generator","Kitchen","Parking","Security","Garden"]'::jsonb,
  6,3,2,true,true);

  -- CARS

  INSERT INTO listings (host_id, type, title, description, location, address, city, price_per_night, price_per_day, images, amenities, max_guests, car_make, car_model, car_year, car_seats, car_transmission, is_active, is_approved)
  VALUES

  (hid,'car','2023 Toyota Camry XSE — Sleek & Reliable','Brand-new 2023 Toyota Camry XSE in Sonic Silver. Full leather interior, Android Auto, Apple CarPlay, smooth V6. Perfect for business meetings, airport runs, or long-distance trips.','Wuse 2','5B Aminu Kano Crescent, Wuse 2','Abuja',NULL,25000,
  ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&q=80&auto=format&fit=crop'],
  '["Air Conditioning","Bluetooth","Apple CarPlay","Android Auto","USB Charging"]'::jsonb,
  5,'Toyota','Camry',2023,5,'automatic',true,true),

  (hid,'car','2022 Mercedes-Benz C300 — Premium Luxury','Sophisticated 2022 C300 in Obsidian Black. Heated leather seats, panoramic sunroof, Burmester sound, MBUX infotainment. Available with or without chauffeur.','Maitama','14 Maitama Close, off Udi Street','Abuja',NULL,45000,
  ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80&auto=format&fit=crop'],
  '["Air Conditioning","Heated Seats","Sunroof","Bluetooth","Premium Sound","USB Charging"]'::jsonb,
  5,'Mercedes-Benz','C300',2022,5,'automatic',true,true),

  (hid,'car','2021 Range Rover Sport HSE — Command the Road','2021 Range Rover Sport HSE in Fuji White. Seven seats, full leather, terrain response. Perfect for VIP movements, family road trips, or navigating Abuja in comfort.','Asokoro','7 Gimbiya Street, Asokoro','Abuja',NULL,65000,
  ARRAY['https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&auto=format&fit=crop'],
  '["Air Conditioning","Heated Seats","Sunroof","Bluetooth","4x4","USB Charging","Premium Sound"]'::jsonb,
  7,'Land Rover','Range Rover Sport',2021,7,'automatic',true,true),

  (hid,'car','2023 Toyota Corolla — Smart City Choice','Fuel-efficient 2023 Corolla in Pearl White. Practical for daily commutes, market runs, and weekend trips. Comfortable with modern infotainment. No hidden charges.','Garki','22 Enugu Crescent, Garki II','Abuja',NULL,18000,
  ARRAY['https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80&auto=format&fit=crop'],
  '["Air Conditioning","Bluetooth","USB Charging","Reversing Camera"]'::jsonb,
  5,'Toyota','Corolla',2023,5,'automatic',true,true),

  (hid,'car','2022 Honda Accord Sport — Comfort & Style','2022 Honda Accord Sport in Sonic Gray Pearl. Turbocharged engine, 10-speed auto, wireless Apple CarPlay, 12-inch touchscreen. Refined and easy on Abuja roads.','Jabi','11 Lake View Drive, Jabi','Abuja',NULL,22000,
  ARRAY['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80&auto=format&fit=crop','https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&q=80&auto=format&fit=crop'],
  '["Air Conditioning","Apple CarPlay","Android Auto","Bluetooth","USB Charging","Sunroof"]'::jsonb,
  5,'Honda','Accord',2022,5,'automatic',true,true);

  RAISE NOTICE 'Seed complete — 15 shortlets + 5 cars inserted (host_id: %)', hid;
END $$;
