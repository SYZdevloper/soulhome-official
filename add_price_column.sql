-- Add price column to resources table
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS price numeric;
