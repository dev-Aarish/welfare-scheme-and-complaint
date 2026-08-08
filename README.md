An AI-powered citizen assistance platform that simplifies access to government welfare schemes and enables transparent grievance redressal through intelligent eligibility matching, multilingual support, geotagged reporting, and real-time complaint tracking.

## Auth setup (Supabase)

1. Create a free project at https://supabase.com (Postgres is included; you can keep your local Prisma DB for app data).
2. Dashboard → Project Settings → API: copy the Project URL and anon `publishable` key.
3. Backend: put both in `backend/.env` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`, then `cd backend && npx prisma migrate dev`.
4. Frontend: copy `frontend/.env.example` to `frontend/.env` and fill `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
5. Optional (recommended for real OTP delivery): in Authentication → Email Templates, open the **Sign In** template and add `{{ .Token }}` so the email shows the 6-digit code. Out of the box Supabase emails a magic link; the app's OTP screen expects a code.
6. Run both servers (`npm run dev` in `backend/` and `frontend/`).

Citizens sign in with **email OTP** (free, no SMS provider needed); officers register from Supabase Authentication (email + password). Leaving env vars empty runs the app in demo mode (guest sign-in), which is the previous behaviour.
