-- Faz 1 Güncellemeler

-- 1. Profiles tablosuna yeni kolonlar ekle
alter table profiles add column if not exists points int default 0;
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists frame text default 'none';
alter table profiles add column if not exists theme text default 'default';

-- 2. Eski questions tablosunu messages'e çevir (veya messages tablosu ekle)
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  reply text,
  replied_at timestamptz,
  to_user_id uuid references profiles(id) on delete cascade not null,
  likes int default 0,
  created_at timestamptz default now()
);

alter table messages enable row level security;

-- Policies
drop policy if exists "Herkes mesaj gönderebilir" on messages;
drop policy if exists "Cevaplı mesajlar herkese açık" on messages;
drop policy if exists "Sahibi kendi mesajlarını görebilir" on messages;
drop policy if exists "Sadece hedef kişi cevaplayabilir" on messages;
drop policy if exists "Herkes like atabilir mesajlar" on messages;

create policy "Herkes mesaj gönderebilir" on messages for insert with check (true);
create policy "Cevaplı mesajlar herkese açık" on messages for select using (reply is not null);
create policy "Sahibi kendi mesajlarını görebilir" on messages for select using (auth.uid() = to_user_id);
create policy "Sadece hedef kişi cevaplayabilir" on messages for update using (auth.uid() = to_user_id);
create policy "Herkes like atabilir mesajlar" on messages for update with check (true);
