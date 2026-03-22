# Trade Partner HQ — Deployment Guide

## Architecture

```
tradepartnerhq.com (Vercel)
   ├── React frontend (Vite build)
   ├── Supabase (database + auth)
   └── GitHub Actions (daily scraper cron)
```

## Step 1: Create a Supabase Project (5 min)

1. Go to https://supabase.com and sign up (free tier is plenty)
2. Click "New Project" → name it `tradepartnerhq`
3. Pick a region close to you (e.g., US East)
4. Set a database password — save it somewhere safe
5. Once created, go to **Settings → API** and copy:
   - **Project URL** (looks like `https://abc123.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) — keep this secret!
6. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → click **Run**
7. Enable PostGIS: go to **Database → Extensions** → search "postgis" → enable it

## Step 2: Push Code to GitHub (5 min)

1. Create a new repo at https://github.com/new
   - Name: `tradepartnerhq`
   - Private is fine
2. In your terminal:
   ```bash
   cd tradepartnerhq
   git init
   git add .
   git commit -m "Initial commit — Trade Partner HQ"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tradepartnerhq.git
   git push -u origin main
   ```
3. Add secrets for the scraper: go to **repo Settings → Secrets → Actions** and add:
   - `SUPABASE_URL` = your Project URL from Step 1
   - `SUPABASE_SERVICE_ROLE_KEY` = your service_role key from Step 1

## Step 3: Deploy to Vercel (5 min)

1. Go to https://vercel.com and sign up with GitHub
2. Click "Import Project" → select your `tradepartnerhq` repo
3. Vercel auto-detects Vite — confirm the settings:
   - Framework: Vite
   - Build command: `pnpm build`
   - Output directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon public key
5. Click **Deploy** — your site will be live at `tradepartnerhq.vercel.app`

## Step 4: Connect Your Domain (5 min)

1. In Vercel, go to your project → **Settings → Domains**
2. Add `tradepartnerhq.com`
3. Vercel will show you DNS records to add
4. Log into GoDaddy → **DNS Management** for tradepartnerhq.com
5. Delete the existing A record and CNAME for `www`
6. Add Vercel's records:
   - **A Record**: `@` → `76.76.21.21`
   - **CNAME**: `www` → `cname.vercel-dns.com`
7. Wait 5-10 minutes for DNS propagation
8. Back in Vercel, click "Verify" — your domain is live!

## Step 5: Run Your First Scrape

The scrapers run automatically every day at 6 AM UTC via GitHub Actions.

To run manually:
1. Go to your GitHub repo → **Actions** tab
2. Click "Daily Event Scraper" → "Run workflow"
3. Watch the logs — events will populate in your Supabase database

To run locally:
```bash
cd scrapers
pip install -r requirements.txt
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-key
python run_all.py
```

## Folder Structure

```
tradepartnerhq/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── data/               # Mock data (fallback)
│   ├── hooks/              # useEvents, useAuth
│   ├── lib/                # Supabase client
│   └── types/              # TypeScript types
├── scrapers/               # Python web scrapers
│   ├── config.py           # Shared config + Supabase client
│   ├── run_all.py          # Main runner (daily cron calls this)
│   ├── scrape_sam_gov.py   # Federal opportunities (SAM.gov API)
│   ├── scrape_state_dots.py    # State DOT SBE/DBE programs
│   ├── scrape_trade_associations.py  # AGC, ABC, NAHB events
│   └── scrape_linkedin.py # LinkedIn + GC website posts
├── supabase/
│   └── schema.sql          # Database schema (run in SQL Editor)
├── .github/workflows/
│   └── daily-scrape.yml    # GitHub Actions cron job
├── vercel.json             # Vercel deployment config
└── .env.example            # Environment variable template
```

## Costs

Everything runs on free tiers:
- **Vercel**: Free (hobby plan) — unlimited deploys, custom domain
- **Supabase**: Free — 500MB database, 50K monthly auth users
- **GitHub Actions**: Free — 2,000 minutes/month (scraper uses ~5 min/day)
