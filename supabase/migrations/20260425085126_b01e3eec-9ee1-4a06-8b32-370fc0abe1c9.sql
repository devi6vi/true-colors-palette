ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS body_image_url TEXT,
  ADD COLUMN IF NOT EXISTS body_type_result TEXT,
  ADD COLUMN IF NOT EXISTS body_type_outfit_picks TEXT[],
  ADD COLUMN IF NOT EXISTS body_type_completed_at TIMESTAMPTZ;