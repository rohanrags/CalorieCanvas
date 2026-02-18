# CalorieCanvas

A private nutrition dashboard:
- Log meals in Telegram
- Sync structured entries into a database
- View daily dashboards + trends online

## Tech
- Next.js (App Router) + Tailwind
- Supabase (Postgres + Auth)
- Vercel hosting

## Local dev

```bash
cd web
cp .env.example .env.local
npm i
npm run dev
```

Then open: http://localhost:3000

## Supabase setup
1. Create a Supabase project
2. In Supabase SQL editor, run: `supabase/schema.sql`
3. In Project Settings → API, copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Paste into `.env.local`

## Telegram ingest
Set `INGEST_API_KEY` (random string) in:
- `.env.local` for local dev
- Vercel project env vars for production

Endpoint:
- `POST /api/ingest/telegram`

Note: for production, we should switch the ingest route to use `SUPABASE_SERVICE_ROLE_KEY` (server-only) to safely bypass RLS.
