-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  analyses_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Analyses table (core data)
create table public.analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  resume_filename text not null,
  resume_storage_path text,
  job_title text,
  company_name text,
  job_description text not null,
  resume_text text not null,
  overall_score integer not null check (overall_score between 0 and 100),
  result jsonb not null,
  status text default 'completed' check (status in ('pending','processing','completed','failed')),
  created_at timestamptz default now()
);

-- Indexes
create index analyses_user_id_idx on public.analyses(user_id);
create index analyses_created_at_idx on public.analyses(created_at desc);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.analyses enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can view own analyses" on public.analyses
  for select using (auth.uid() = user_id);

create policy "Users can insert own analyses" on public.analyses
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own analyses" on public.analyses
  for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Supabase Storage bucket
insert into storage.buckets (id, name, public) values ('resumes', 'resumes', false);

create policy "Users can upload own resumes" on storage.objects
  for insert with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can read own resumes" on storage.objects
  for select using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
