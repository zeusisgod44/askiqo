-- ============================================
-- ASKIQO SUPABASE SCHEMA
-- ============================================

-- PROFILES
create table if not exists profiles (
  id uuid references auth.users primary key,
  username text unique not null,
  bio text,
  avatar_url text,
  coins int default 0,
  active_effect text default 'none',
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Public profiles" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- PUBLIC MESSAGES (Questions)
create table if not exists public_messages (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  category text default 'game',
  reply text,
  replied_at timestamptz,
  to_user_id uuid references profiles(id) on delete cascade,
  asked_by_user_id uuid references profiles(id),
  likes int default 0,
  created_at timestamptz default now()
);
alter table public_messages enable row level security;
create policy "Anyone can ask" on public_messages for insert with check (true);
create policy "Everyone sees answered" on public_messages for select using (true);
create policy "Target user and asker see unanswered" on public_messages for select using (
  auth.uid() = to_user_id OR auth.uid() = asked_by_user_id OR reply is not null
);
create policy "Target can reply" on public_messages for update using (auth.uid() = to_user_id);

-- PROFILE EFFECTS (Purchased)
create table if not exists profile_effects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  effect_id text not null,
  purchased_at timestamptz default now(),
  unique(user_id, effect_id)
);
alter table profile_effects enable row level security;
create policy "Users see own effects" on profile_effects for select using (auth.uid() = user_id);
create policy "Users manage own effects" on profile_effects for all using (auth.uid() = user_id);

-- INDEXES
create index if not exists idx_messages_category on public_messages(category);
create index if not exists idx_messages_to_user on public_messages(to_user_id);
create index if not exists idx_messages_asked_by on public_messages(asked_by_user_id);
create index if not exists idx_effects_user on profile_effects(user_id);

-- TRIGGER: Create profile on signup
create or replace function public.handle_new_user()
returns trigger
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.user_metadata->>'username');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
