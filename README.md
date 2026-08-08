An AI-powered citizen assistance platform that simplifies access to government welfare schemes and enables transparent grievance redressal through intelligent eligibility matching, multilingual support, geotagged reporting, and real-time complaint tracking.

## Auth setup (Supabase)

1. Create a free project at https://supabase.com (Postgres is included; you can keep your local Prisma DB for app data).
2. Dashboard → Project Settings → API: copy the Project URL and anon `publishable` key.
3. Backend: put both in `backend/.env` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`, then `cd backend && npx prisma migrate dev`.
4. Frontend: copy `frontend/.env.example` to `frontend/.env` and fill `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
5. Optional (recommended for real OTP delivery): in Authentication → Email Templates, open the **Sign In** template and add `{{ .Token }}` so the email shows the 6-digit code. Out of the box Supabase emails a magic link; the app's OTP screen expects a code.
6. Run both servers (`npm run dev` in `backend/` and `frontend/`).

Citizens sign in with **email OTP** (free, no SMS provider needed); officers register from Supabase Authentication (email + password). Leaving env vars empty runs the app in demo mode (guest sign-in), which is the previous behaviour.

## Voice setup (Sarvam AI speech-to-text)

The Sahayak chat's voice button records your voice and transcribes it with the **Sarvam AI speech-to-text API**, which understands Bengali (`bn-IN`) and Hindi (`hi-IN`) natively — the browser's built-in speech recognition only handles English reliably.

1. Get a free key at https://dashboard.sarvam.ai (Speech → API keys).
2. Add it to `backend/.env` as `SARVAM_API_KEY=...` (see `backend/.env.example`). Optional: `SARVAM_STT_MODEL=saarika:v2.5` (default) to switch models. Note: the old `saarika:v1` model has been retired by Sarvam.
3. Restart the backend. The transcript lands in the chat input box for review — edit it, then press Send.

Without a key the voice button falls back to the browser's built-in (English-only) speech recognition, so the chat still works.
