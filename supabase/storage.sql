-- ============================================================
-- Storage: inventory photo bucket + RLS
-- Run this once in Supabase Dashboard → SQL Editor
-- ============================================================

-- Public bucket so we can read photos by URL without signing.
-- Writes are still protected by the policies below.
insert into storage.buckets (id, name, public)
values ('inventory-photos', 'inventory-photos', true)
on conflict (id) do nothing;

-- Allow members of a household to upload photos into a folder
-- whose name matches their household_id.
create policy "members can upload inventory photos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'inventory-photos'
    and (storage.foldername(name))[1] = get_my_household_id()::text
  );

-- Allow members to update photos in their own household folder.
create policy "members can update inventory photos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'inventory-photos'
    and (storage.foldername(name))[1] = get_my_household_id()::text
  );

-- Allow members to delete photos in their own household folder.
create policy "members can delete inventory photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'inventory-photos'
    and (storage.foldername(name))[1] = get_my_household_id()::text
  );
