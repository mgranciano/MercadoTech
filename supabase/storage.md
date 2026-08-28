# MercadoTech Storage Configuration (Reference)

This document describes the Storage buckets and access policies for MercadoTech.

## Buckets Overview

### 1. `product-images` (Public Read)

Stores product gallery images organized by seller and product.

**Path Convention:**
```
product-images/{seller_id}/{product_id}/{filename}
```

**Access:**
- **READ (Public):** Anonymous and authenticated users can view product images
- **WRITE:** Authenticated sellers only; can upload to their own `{seller_id}/` folder
- **DELETE:** Authenticated sellers only; can delete from their own `{seller_id}/` folder

**Constraints:**
- Max file size: 5 MB (enforced client-side; backend should reject >5MB)
- MIME types: `image/jpeg`, `image/png`, `image/webp` (client-side validation)

**Example:**
```
PUT /storage/v1/object/product-images/550e8400-e29b-41d4-a716-446655440000/880e8400-e29b-41d4-a716-446655440111/main.jpg
```

**Usage Notes:**
- RLS policy enforces `(storage.foldername(name))[1] = auth.uid()` — first path segment must be seller's UUID
- Sellers can organize product images in any structure within their folder
- Images are immutable after upload; update = delete + reupload
- `product_images` table tracks order via `position` field; client updates this after upload

---

### 2. `avatars` (Public Read)

Stores user profile avatars.

**Path Convention:**
```
avatars/{user_id}/{filename}
```

**Access:**
- **READ (Public):** Anyone can view avatars
- **WRITE:** Authenticated users only; can upload to their own `{user_id}/` folder
- **DELETE:** Authenticated users only; can delete from their own `{user_id}/` folder

**Constraints:**
- Max file size: 5 MB
- MIME types: `image/jpeg`, `image/png`, `image/webp`

**Example:**
```
PUT /storage/v1/object/avatars/550e8400-e29b-41d4-a716-446655440000/avatar.jpg
```

**Usage Notes:**
- One avatar per user (convention: `{user_id}/avatar.jpg` or `{user_id}/avatar_v{n}.jpg`)
- Store avatar path in `profiles.avatar_path` after successful upload
- Deletion removes the file but doesn't update `avatar_path` — handle nulling in UI

---

## Implementation Details

### RLS Policies on storage.objects

Policies are defined per operation (SELECT, INSERT, UPDATE, DELETE):

**product-images:**
- `product_images_bucket_select`: Public read
- `product_images_bucket_insert`: Auth + seller role + folder = seller_id
- `product_images_bucket_update`: Auth + seller role + folder = seller_id
- `product_images_bucket_delete`: Auth + seller role + folder = seller_id

**avatars:**
- `avatars_bucket_select`: Public read
- `avatars_bucket_insert`: Auth + folder = user_id
- `avatars_bucket_update`: Auth + folder = user_id
- `avatars_bucket_delete`: Auth + folder = user_id

### Helper Function: `storage.foldername(name)`

Extracts path segments as an array. Example:
```sql
storage.foldername('a/b/c.jpg') → ['a', 'b', 'c.jpg']
(storage.foldername('a/b/c.jpg'))[1] → 'a'
```

---

## Known Gaps (from ReadHub)

1. **Files don't exist until uploaded:** The database schema references paths like `product-images/{seller_id}/{product_id}/{n}.jpg`, but these files don't exist until a user uploads them via the UI or API. This is expected in ReadHub's seeding pattern.

2. **Client-side MIME/size validation:** The migration defines the RLS policies but doesn't enforce MIME types or file size limits at the database layer. Implement these checks in the client application before upload.

3. **No automatic cleanup:** Deleting a product or user doesn't cascade-delete their files. Implement cleanup via:
   - Admin dashboard for orphaned files
   - Scheduled jobs to remove unreferenced files
   - Client confirmation before deletion

---

## Usage from Client

### Uploading a Product Image

```typescript
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient()
const file = /* File input from user */
const seller_id = auth.user().id // or use auth.uid()
const product_id = /* product UUID */

const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`${seller_id}/${product_id}/${Date.now()}.jpg`, file)

if (!error) {
  // data.path contains the full path
  // Store in product_images.image_path
}
```

### Uploading an Avatar

```typescript
const user_id = auth.user().id
const file = /* File input from user */

const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${user_id}/avatar.jpg`, file, {
    upsert: true // Replace existing avatar
  })

if (!error) {
  // Update profiles.avatar_path with data.path
}
```

### Getting Public URLs

```typescript
const imageUrl = supabase.storage
  .from('product-images')
  .getPublicUrl('550e8400-e29b-41d4-a716-446655440000/880e8400-e29b-41d4-a716-446655440111/main.jpg')
  .data.publicUrl
```

---

## Bucket Configuration Summary

| Setting | product-images | avatars |
|---------|-----------------|---------|
| Public | ✓ Read only | ✓ Read only |
| CORS | Auto (Supabase default) | Auto |
| Versioning | Disabled | Disabled |
| Max upload | 5 MB (client enforced) | 5 MB (client enforced) |

---

*Configuration defined in: supabase/migrations/0018_create_storage_buckets.sql*
