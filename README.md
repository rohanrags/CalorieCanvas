# CalorieCanvas

A private nutrition dashboard:
- Log meals in Telegram
- Sync structured entries into a database
- View daily dashboards + trends online

## Local dev

```bash
cp .env.example .env.local
npm i
npm run dev
```

Open: http://localhost:3000

## Supabase setup
1. Create a Supabase project
2. Run `supabase/schema.sql` in Supabase SQL editor
3. Set env vars in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; required for Telegram ingest)
   - `INGEST_API_KEY`

## Telegram ingest
Endpoint:
- `POST /api/ingest/telegram`

Notes:
- This route uses `SUPABASE_SERVICE_ROLE_KEY` so it can write without a browser login session.
- If a Telegram user isn’t linked yet, ingests are stored into `unlinked_ingest`.
