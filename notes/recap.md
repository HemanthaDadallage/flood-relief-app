# Flood Relief App – Admin Login / Supabase Setup Recap

## Supabase project
- URL: `https://lvutdasuzhjunsykqwqq.supabase.co`
- Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dXRkYXN1emhqdW5zeWtxd3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTAzNjYsImV4cCI6MjA3OTk4NjM2Nn0.SUs8ybfqLyYJ4QYKMGF_nf3pQszV7P6Cu6yIutsVNB0`
- Auth user for admin: `likehemantha@gmail.com` with id `646d334c-cde3-4cbb-b817-f3174d8c1ee8`.

## Local env
`.env.local` should contain:
```
NEXT_PUBLIC_SUPABASE_URL=https://lvutdasuzhjunsykqwqq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dXRkYXN1emhqdW5zeWtxd3FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTAzNjYsImV4cCI6MjA3OTk4NjM2Nn0.SUs8ybfqLyYJ4QYKMGF_nf3pQszV7P6Cu6yIutsVNB0
```
Vercel env (Production) should match the same values.

## Middleware change
- `src/middleware.ts` now uses `getAll/setAll` cookies only (no get/set/remove) to satisfy `@supabase/auth-helpers-nextjs` and avoid redirect loops.
- Admin routes are protected; `/admin/login` is allowed without a session.

## Supabase schema (key parts)
- Tables: `help_requests`, `volunteers`, `admin_profiles` (only columns `id`, `role`, `created_at` in admin_profiles).
- RLS needed for admin_profiles; simplest working policies:
```sql
alter table admin_profiles enable row level security;

drop policy if exists "admin_profiles_select" on admin_profiles;
create policy "admin_profiles_select"
on admin_profiles for select
to authenticated
using (true);

drop policy if exists "admin_profiles_insert" on admin_profiles;
create policy "admin_profiles_insert"
on admin_profiles for insert
to authenticated
with check (true);

drop policy if exists "admin_profiles_update" on admin_profiles;
create policy "admin_profiles_update"
on admin_profiles for update
to authenticated
using (id = auth.uid()) with check (id = auth.uid());
```

## Admin row upsert (for the auth user)
```sql
delete from admin_profiles where id = '646d334c-cde3-4cbb-b817-f3174d8c1ee8';
insert into admin_profiles (id, role) values ('646d334c-cde3-4cbb-b817-f3174d8c1ee8', 'admin');
```

## Login flow
- Client signs in via `/admin/login` (uses anon key).
- Middleware checks session and fetches `admin_profiles` by `session.user.id`. If the row is readable, user is allowed to `/admin/dashboard`; otherwise “not authorized” shows.
- If you still see “not authorized,” confirm: correct user id, admin row exists, policies above are applied, Vercel env uses the same Supabase project, and RLS is enabled.

## Deploy
- Repo: `HemanthaDadallage/flood-relief-app` (main branch).
- Push to `main` triggers Vercel build. Latest middleware fix must be deployed.
