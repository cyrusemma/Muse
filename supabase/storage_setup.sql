-- ==============================================================================
-- Muse Storage Buckets Setup & Policies
-- Run this in Supabase SQL Editor
-- ==============================================================================

-- 1. Create storage buckets
insert into storage.buckets (id, name, public)
values 
  ('tracks', 'tracks', true),
  ('covers', 'covers', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Storage Policies for 'tracks' bucket (Audio files)
create policy "Public Access to Tracks"
  on storage.objects for select
  using (bucket_id = 'tracks');

create policy "Authenticated Users can upload tracks"
  on storage.objects for insert
  with check (bucket_id = 'tracks' and auth.role() = 'authenticated');

create policy "Users can update own tracks in storage"
  on storage.objects for update
  using (bucket_id = 'tracks' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own tracks in storage"
  on storage.objects for delete
  using (bucket_id = 'tracks' and auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Storage Policies for 'covers' bucket (Artwork)
create policy "Public Access to Covers"
  on storage.objects for select
  using (bucket_id = 'covers');

create policy "Authenticated Users can upload covers"
  on storage.objects for insert
  with check (bucket_id = 'covers' and auth.role() = 'authenticated');

create policy "Users can update own covers"
  on storage.objects for update
  using (bucket_id = 'covers' and auth.role() = 'authenticated');

-- 4. Storage Policies for 'avatars' bucket (Profile pictures)
create policy "Public Access to Avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update own avatars"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');
