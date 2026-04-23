ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS height_cm numeric,
  ADD COLUMN IF NOT EXISTS weight_kg numeric,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS body_shape text,
  ADD COLUMN IF NOT EXISTS bust_size text,
  ADD COLUMN IF NOT EXISTS aesthetic text,
  ADD COLUMN IF NOT EXISTS style_picks text[],
  ADD COLUMN IF NOT EXISTS color_season text,
  ADD COLUMN IF NOT EXISTS clothes_quiz_completed_at timestamptz;