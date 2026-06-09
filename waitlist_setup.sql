-- ==========================================
-- Waitlist & Email Logs Setup
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Create Waitlist table
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  wants_reminder boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Waitlist
alter table public.waitlist enable row level security;

-- Allow anyone to insert into the waitlist
create policy "Anyone can join the waitlist" 
  on public.waitlist for insert 
  with check (true);

-- Only admins can view and manage the waitlist
create policy "Admins can manage waitlist" 
  on public.waitlist for all 
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- 2. Create Email Logs table
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  recipient_count integer not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Email Logs
alter table public.email_logs enable row level security;

-- Only admins can view and insert into email logs
create policy "Admins can manage email logs" 
  on public.email_logs for all 
  using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );
