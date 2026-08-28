-- Create Storage buckets and policies
-- Two buckets: product-images (for product gallery) and avatars (for user profiles)

-- ============================================================================
-- CREATE BUCKETS
-- ============================================================================

-- Bucket for product images (public read, authenticated write)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict do nothing;

-- Bucket for avatars (public read, authenticated write)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict do nothing;

-- ============================================================================
-- PRODUCT-IMAGES BUCKET POLICIES
-- ============================================================================

-- SELECT (read): everyone can read
create policy "product_images_bucket_select"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- INSERT (upload): authenticated users can upload to their seller_id folder
-- Path convention: {seller_id}/{product_id}/{filename}
create policy "product_images_bucket_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and auth.uid() is not null
    and (select role = 'seller' from public.profiles where id = auth.uid()) = true
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE (move/rename): authenticated sellers can update files in their folder
create policy "product_images_bucket_update"
  on storage.objects for update
  with check (
    bucket_id = 'product-images'
    and auth.uid() is not null
    and (select role = 'seller' from public.profiles where id = auth.uid()) = true
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE (remove): authenticated sellers can delete from their folder
create policy "product_images_bucket_delete"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and auth.uid() is not null
    and (select role = 'seller' from public.profiles where id = auth.uid()) = true
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- AVATARS BUCKET POLICIES
-- ============================================================================

-- SELECT (read): everyone can read
create policy "avatars_bucket_select"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- INSERT (upload): authenticated users can upload to their own user_id folder
-- Path convention: {user_id}/{filename}
create policy "avatars_bucket_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE (move/rename): authenticated users can update files in their folder
create policy "avatars_bucket_update"
  on storage.objects for update
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE (remove): authenticated users can delete from their folder
create policy "avatars_bucket_delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- NOTES
-- ============================================================================
-- Storage policy enforcement:
--
-- product-images bucket:
--   - Public read (anyone can view)
--   - Upload only by sellers; path must start with seller_id (auth.uid())
--   - Example: PUT /storage/v1/object/product-images/{seller_uuid}/{product_uuid}/image.jpg
--   - Mime types and max size enforced by client-side validation (see docs)
--   - Recommended limits: 5MB per file, JPEG/PNG/WebP only
--
-- avatars bucket:
--   - Public read (profile pictures visible to all)
--   - Upload only by owner; path must start with user_id (auth.uid())
--   - Example: PUT /storage/v1/object/avatars/{user_uuid}/avatar.jpg
--   - Recommended limits: 5MB per file, JPEG/PNG/WebP only
--
-- NOTE: storage.foldername(name) returns array of path segments
--       (storage.foldername('a/b/c.jpg'))[1] returns 'a'
--
-- Gap known from ReadHub: Actual image files do not exist in Storage
-- until uploaded via client UI or API. This schema only defines structure.
-- Seed data references paths that don't exist yet.
