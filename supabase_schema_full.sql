-- Profiller
alter table profiles add column if not exists points int default 0;
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists frame text default 'none';
alter table profiles add column if not exists theme text default 'default';
alter table profiles add column if not exists unread_messages int default 0;

-- Genel mesajlar (profilde görünen, herkese açık)
create table if not exists public_messages (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  reply text,
  replied_at timestamptz,
  to_user_id uuid references profiles(id) on delete cascade not null,
  likes int default 0,
  created_at timestamptz default now()
);

alter table public_messages enable row level security;
create policy "Herkes mesaj gönderebilir" on public_messages for insert with check (true);
create policy "Cevaplı mesajlar herkese açık" on public_messages for select using (reply is not null);
create policy "Sahibi kendi mesajlarını görebilir" on public_messages for select using (auth.uid() = to_user_id);
create policy "Sadece hedef kişi cevaplayabilir" on public_messages for update using (auth.uid() = to_user_id);
create policy "Herkes like atabilir" on public_messages for update with check (true);

-- DM Mesajları (anonim sohbet)
create table if not exists direct_messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table direct_messages enable row level security;
create policy "Herkes DM gönderebilir" on direct_messages for insert with check (true);
create policy "Sadece katılanlar görebilir" on direct_messages for select using (
  auth.uid() = receiver_id OR auth.uid() = sender_id
);
create policy "Hedef kişi oku işaretleyebilir" on direct_messages for update using (auth.uid() = receiver_id);

-- Bildirimler
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  message text,
  related_user_id uuid references profiles(id),
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;
create policy "Sadece sahibi görebilir" on notifications for select using (auth.uid() = user_id);
