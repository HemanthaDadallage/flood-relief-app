# Flood Relief Rapid-Response App
Next.js + Tailwind + Supabase app that connects people needing help with volunteers. Includes public “Need Help” / “Want to Help” forms and a secure admin dashboard with matching and status updates.

## Quick Start
```bash
npm install
npm run dev
# app will start on http://localhost:3000 (or an open port)
```

## Environment Variables
Create `.env.local` with your Supabase project values:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=... # only needed if you add server-side writes
```

## Supabase Setup
1) Create a Supabase project.  
2) In the SQL editor, run `docs/supabase-schema.sql` to create tables, enums, RLS policies, and the admin helper function.  
3) Create an auth user for admins, then add it to `admin_profiles`:
```sql
insert into admin_profiles (id, role) values ('<auth-user-uuid>', 'admin');
```

Tables (simplified):
- `help_requests`: submissions from the public, with urgency, status, admin notes, and optional assigned volunteer.
- `volunteers`: registered volunteers with skills (`type_of_help` array), availability, and status.
- `admin_profiles`: marks which Supabase auth users can access the dashboard.

## Admin Dashboard
- `/admin/login`: Supabase email/password login for admins.
- `/admin/dashboard`: filter/search by status, urgency, location, or text; view and drill into requests.
- `/admin/requests/[id]`: assign/unassign volunteers, update status, add notes, and see suggested volunteers.

## Testing & Linting
```bash
npm test -- --runInBand
npm run lint
```

## Deployment
- Vercel works out of the box. Set the Supabase environment variables in the project settings.
- Ensure the Supabase schema and admin profile are applied before going live.
