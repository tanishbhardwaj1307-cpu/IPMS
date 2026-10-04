# IPMS — Internship & Placement Management System

This project keeps the original React/Vite UI and workflow, but authentication and database authorization are now handled by Supabase Auth + PostgreSQL RLS.

## Stack

- React 18 + TypeScript
- Vite
- React Router
- Tailwind CSS
- Supabase Auth + PostgreSQL/RLS

## 1. Requirements

Install Node.js 18+ (LTS recommended) and npm.

```bash
node -v
npm -v
```

## 2. Install dependencies

From the `project` directory:

```bash
npm ci
```

If you intentionally need to regenerate the lockfile instead:

```bash
npm install
```

## 3. Configure the browser environment

Copy `.env.example` to `.env` and set the public Supabase values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Only the publishable/anon key belongs in the browser. **Never put a service-role/secret key in `.env` or frontend code.**

## 4. Apply the database migrations

Run these files in order in the Supabase SQL Editor, or with the Supabase CLI:

```text
supabase/migrations/20261004084309_001_create_core_schema.sql
supabase/migrations/20261004084418_002_seed_dummy_data.sql
supabase/migrations/20261004084746_003_branch_stats_rpc.sql
supabase/migrations/20261004084800_004_auth_security.sql
```

Migration 004 removes the old plaintext `profiles.password` column, links application profiles to `auth.users`, installs the Auth trigger, and replaces the old `anon/authenticated USING(true)` policies with role/ownership-based RLS.

## 5. Create the seeded Auth users

The seed migration intentionally does **not** store passwords. Use the trusted bootstrap script once after the database seed is applied.

In PowerShell:

```powershell
$env:SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVER_ONLY_SERVICE_ROLE_OR_SECRET_KEY"
$env:IPMS_ADMIN_PASSWORD="choose-admin-password"
$env:IPMS_STUDENT_PASSWORD="choose-student-password"
$env:IPMS_COMPANY_PASSWORD="choose-company-password"
npm run bootstrap:auth
```

In macOS/Linux:

```bash
export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVER_ONLY_SERVICE_ROLE_OR_SECRET_KEY"
export IPMS_ADMIN_PASSWORD="choose-admin-password"
export IPMS_STUDENT_PASSWORD="choose-student-password"
export IPMS_COMPANY_PASSWORD="choose-company-password"
npm run bootstrap:auth
```

The service/secret key is used only by this local trusted script and must never be exposed to the browser or committed to Git.

Seeded demo account emails are:

| Role | Email |
|---|---|
| Admin | `admin@ipms.edu` |
| Student | `student01@ipms.edu` |
| Company | `hr@techvision.in` |

Their passwords are whatever you supplied to the three `IPMS_*_PASSWORD` environment variables. The client no longer embeds demo passwords.

## 6. Deploy the Admin account-management Edge Function

Admin pages need the Supabase Admin Auth API to create/update/delete other Auth users. The secret key is never sent to the browser.

Install/login to the Supabase CLI if needed. If this checkout has no `supabase/config.toml` yet, initialize the CLI metadata once:

```bash
supabase init
supabase link --project-ref YOUR_PROJECT_REF
```

Then deploy the function:

```bash
supabase functions deploy admin-user
```

The function uses the project-managed `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and server-side service/secret key environment values supplied by Supabase Edge Functions.

## 7. Run locally

```bash
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

## 8. Production build

```bash
npm run build
```

Preview the production build with:

```bash
npm run preview
```

## Authentication model

- Passwords are handled only by Supabase Auth and stored by Supabase as password hashes.
- `public.profiles.auth_user_id` links the application profile to `auth.users`.
- A database trigger creates the application profile and its Student/Company row from Auth metadata during registration.
- The frontend uses the Supabase Auth session instead of `localStorage` as an authentication source.
- Route guards prevent a signed-in user from opening another role's dashboard.
- PostgreSQL RLS independently enforces Admin/Student/Company access, so changing a URL or manually calling the REST API cannot bypass the role boundary.

## Important security rules

- Never expose `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` in frontend code.
- Never add plaintext passwords to `profiles`.
- Never re-enable anonymous CRUD policies such as `USING (true)` / `WITH CHECK (true)` on application tables.
- Keep `.env` out of Git.

## Main workflows preserved

The existing UI and database workflows remain in place:

- Admin: students, companies, internships, jobs, applications, interviews, placements, dashboard statistics.
- Student: profile, internships, jobs, applications, interviews, placement view.
- Company: profile, internships, jobs, applicants, interviews, placements.
