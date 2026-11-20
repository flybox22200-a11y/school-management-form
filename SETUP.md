# Setup

1. **Supabase**: create a project, open the SQL editor and run `supabase/migrations/0001_init.sql`.
2. **Researcher account**: Authentication → Users → *Add user* (email + password). Then in SQL:
   `insert into public.admins (user_id) values ('<that user's id>');`
   Also turn off public sign-ups (Authentication → Sign In / Providers → disable "Allow new users to sign up").
3. **Env**: copy `.env.example` to `.env.local` and set `SUPABASE_URL` and `SUPABASE_ANON_KEY`. Never use the service-role key.
4. **Run**: `npm install`, then `npm run dev`. Open `/` for the public site and `/admin` for the dashboard.
5. **Deploy (Vercel)**: import the repo and add the same two env vars.

## Where things live
- `src/lib/questionnaire.ts`: every question (ids q1–q38). Edit wording here.
- `src/lib/validation.ts`: shared client/server validation and sanitising.
- `src/app/questionnaire/actions.ts`: the submit server action.
- `src/app/admin/(panel)`: the dashboard, the submission detail page and `/admin/export?format=csv|json`.
- `src/proxy.ts`: refreshes the session and redirects signed-out users away from `/admin`.

Security comes from Supabase RLS. The public can only insert, and only users in `admins` can read or update.
