-- Supabase'de SQL Editor'a bu kodu yapıştır ve çalıştır

-- 1. Profiller tablosu
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  bio text,
  created_at timestamptz default now()
);

-- 2. Sorular tablosu
create table questions (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  answer text,
  answered_at timestamptz,
  likes int default 0,
  to_user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

-- 3. Yeni kayıt olunca otomatik profil oluştur
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Row Level Security
alter table profiles enable row level security;
alter table questions enable row level security;

-- Profiller: herkes okuyabilir, sadece kendisi güncelleyebilir
create policy "Profiller herkese açık" on profiles for select using (true);
create policy "Kendi profilini güncelle" on profiles for update using (auth.uid() = id);

-- Sorular: herkes ekleyebilir (anonim soru)
create policy "Herkes soru sorabilir" on questions for insert with check (true);
-- Cevaplı sorular herkese açık
create policy "Cevaplı sorular herkese açık" on questions for select using (answer is not null);
-- Sahibi tüm sorularını görebilir
create policy "Sahibi kendi sorularını görebilir" on questions for select using (auth.uid() = to_user_id);
-- Sadece sorulacak kişi cevaplayabilir
create policy "Sadece hedef kişi cevaplayabilir" on questions for update using (auth.uid() = to_user_id);
-- Like güncelleme herkese açık
create policy "Herkes like atabilir" on questions for update using (true) with check (true);
