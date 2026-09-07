# KC MENA — Website + Custom CMS

Kasumigaseki Capital MENA. Next.js (App Router) + Supabase (PostgreSQL) + ground-up custom admin console.

- Architecture & data models: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Database schema: [`db/schema.sql`](db/schema.sql)

## Project layout

```
public/            delivered static site (served until each page is migrated in Phase 2)
src/app/(admin)/   /admin console (auth-protected)
src/app/(auth)/    /admin/login
src/app/api/       auth + content API routes
src/lib/           db, auth, slug helpers
db/schema.sql      full CMS schema (apply to Vercel Postgres)
scripts/           create-admin.mjs
```

## Local development

```bash
npm install
cp .env.example .env.local     # fill DATABASE_URL + AUTH_SECRET
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin (login at `/admin/login`)

## First-time setup (after creating the Supabase project)

1. Create a project at [supabase.com](https://supabase.com) (or use the client's project).
2. Apply the schema — Supabase Dashboard → **SQL Editor** → paste `db/schema.sql` → Run.
3. Create your admin user:
   ```bash
   npm run admin:create -- you@example.com "StrongPassword" "Your Name"
   ```
4. Generate `AUTH_SECRET` if you haven't:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

**Connection string:** Supabase Dashboard → Project Settings → Database → Connection string.
For Vercel (serverless) use the **Transaction pooler** string (port 6543). The app
already sets `prepare: false`, which that pooler requires.

## Deploy to Vercel

1. Push this folder to a git repo (GitHub) and import it in Vercel.
2. In Vercel → Settings → Environment Variables, add `DATABASE_URL` (your Supabase
   **transaction pooler** connection string, port 6543) and `AUTH_SECRET` for
   Production + Preview.
3. Redeploy, then run steps “First-time setup” against the same Supabase project
   (schema via the SQL Editor, admin user via `npm run admin:create`).
4. Point the `kasumigaseki.ae` domain in Vercel → Settings → Domains.

## Notes

- Static pages in `public/` are served via `next.config.mjs` rewrites; as Phase 2 rebuilds pages as Next routes, the routes automatically take precedence — no downtime.
- Salesforce dual-write and the RSS moderation pipeline land in Phase 3 (tables and admin placeholders already in place).
