-- Policies Storage pour le bucket public "places"
-- SQL Editor Supabase

drop policy if exists "Public read places images" on storage.objects;
drop policy if exists "Authenticated upload places images" on storage.objects;
drop policy if exists "Authenticated update places images" on storage.objects;
drop policy if exists "Authenticated delete places images" on storage.objects;

create policy "Public read places images"
on storage.objects for select
using (bucket_id = 'places');

create policy "Authenticated upload places images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'places');

create policy "Authenticated update places images"
on storage.objects for update
to authenticated
using (bucket_id = 'places')
with check (bucket_id = 'places');

create policy "Authenticated delete places images"
on storage.objects for delete
to authenticated
using (bucket_id = 'places');
