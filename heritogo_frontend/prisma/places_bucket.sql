-- Policy Storage pour le bucket public "places"
-- À exécuter dans Supabase > SQL Editor si l'upload admin est refusé (RLS)

create policy if not exists "Public read places images"
on storage.objects for select
using (bucket_id = 'places');

create policy if not exists "Authenticated upload places images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'places');

create policy if not exists "Authenticated update places images"
on storage.objects for update
to authenticated
using (bucket_id = 'places');

create policy if not exists "Authenticated delete places images"
on storage.objects for delete
to authenticated
using (bucket_id = 'places');
