-- 1. Create purchases table
CREATE TABLE IF NOT EXISTS public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  calendly_event_uri text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins_manage_purchases" ON public.purchases FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 2. Add calendly_url to resources
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS calendly_url text;

-- 3. Modify downloads table to remove subscription requirement
ALTER TABLE public.downloads ALTER COLUMN billing_period_start DROP NOT NULL;
ALTER TABLE public.downloads ALTER COLUMN billing_period_end DROP NOT NULL;

-- 4. Drop subscriptions table (Optional but recommended for cleanup)
-- DROP TABLE IF EXISTS public.subscriptions CASCADE;
