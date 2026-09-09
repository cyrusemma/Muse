-- ==============================================================================
-- Muse Database Schema (Complete Migration)
-- Execute this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 2. Tracks Table
-- ------------------------------------------------------------------------------
create table if not exists public.tracks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  artist text not null,
  genre text,
  duration_seconds integer default 0 not null,
  audio_url text not null,
  cover_url text,
  play_count integer default 0 not null,
  likes_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 3. Playlists Table
-- ------------------------------------------------------------------------------
create table if not exists public.playlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  cover_url text,
  is_public boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 4. Playlist Tracks Junction Table
-- ------------------------------------------------------------------------------
create table if not exists public.playlist_tracks (
  id uuid default gen_random_uuid() primary key,
  playlist_id uuid references public.playlists(id) on delete cascade not null,
  track_id uuid references public.tracks(id) on delete cascade not null,
  position integer default 0 not null,
  added_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(playlist_id, track_id)
);

-- ------------------------------------------------------------------------------
-- 5. Liked Tracks Table
-- ------------------------------------------------------------------------------
create table if not exists public.liked_tracks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  track_id uuid references public.tracks(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, track_id)
);

-- ------------------------------------------------------------------------------
-- 6. Play History Table
-- ------------------------------------------------------------------------------
create table if not exists public.play_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  track_id uuid references public.tracks(id) on delete cascade not null,
  played_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 7. Follows Table
-- ------------------------------------------------------------------------------
create table if not exists public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- ------------------------------------------------------------------------------
-- 8. Stored Procedures & Functions
-- ------------------------------------------------------------------------------

-- Increment play count safely
create or replace function public.increment_play_count(track_id uuid)
returns void as $$
begin
  update public.tracks
  set play_count = play_count + 1
  where id = track_id;
end;
$$ language plpgsql security definer;

-- Trigger to create a public.profile automatically when a new user signs up in Auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_username text;
begin
  raw_username := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    raw_username,
    coalesce(new.raw_user_meta_data->>'full_name', raw_username),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do update set
    username = excluded.username;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 9. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.tracks enable row level security;
alter table public.playlists enable row level security;
alter table public.playlist_tracks enable row level security;
alter table public.liked_tracks enable row level security;
alter table public.play_history enable row level security;
alter table public.follows enable row level security;

-- Profiles: Anyone can view, user can update their own
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Tracks: Anyone can view, authenticated users can insert, owner can update/delete
create policy "Tracks are viewable by everyone"
  on public.tracks for select using (true);

create policy "Users can upload their own tracks"
  on public.tracks for insert with check (auth.uid() = user_id);

create policy "Users can update own tracks"
  on public.tracks for update using (auth.uid() = user_id);

create policy "Users can delete own tracks"
  on public.tracks for delete using (auth.uid() = user_id);

-- Playlists: Public playlists viewable by all, owner can view all their own
create policy "Playlists viewable by all if public or by owner"
  on public.playlists for select using (is_public = true or auth.uid() = user_id);

create policy "Users can create playlists"
  on public.playlists for insert with check (auth.uid() = user_id);

create policy "Users can update own playlists"
  on public.playlists for update using (auth.uid() = user_id);

create policy "Users can delete own playlists"
  on public.playlists for delete using (auth.uid() = user_id);

-- Playlist Tracks: Viewable if playlist is viewable, owner can modify
create policy "Playlist tracks viewable by everyone"
  on public.playlist_tracks for select using (true);

create policy "Users can add tracks to their playlists"
  on public.playlist_tracks for insert with check (
    exists (
      select 1 from public.playlists
      where id = playlist_id and user_id = auth.uid()
    )
  );

create policy "Users can remove tracks from their playlists"
  on public.playlist_tracks for delete using (
    exists (
      select 1 from public.playlists
      where id = playlist_id and user_id = auth.uid()
    )
  );

-- Liked tracks: Users can view and manage their own likes
create policy "Users can view own liked tracks"
  on public.liked_tracks for select using (auth.uid() = user_id);

create policy "Users can like tracks"
  on public.liked_tracks for insert with check (auth.uid() = user_id);

create policy "Users can unlike tracks"
  on public.liked_tracks for delete using (auth.uid() = user_id);

-- Play history: Users can view and insert their own history
create policy "Users can view own play history"
  on public.play_history for select using (auth.uid() = user_id);

create policy "Users can record play history"
  on public.play_history for insert with check (auth.uid() = user_id);
