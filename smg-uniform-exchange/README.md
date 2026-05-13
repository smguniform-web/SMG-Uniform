# St Maria Goretti Uniform Exchange

A deploy-ready React/Vite website for parents to submit second-hand uniform listings and for other families to browse approved listings.

## What it does

- Public website for available uniforms
- Search and category filtering
- Parent listing submission form
- Photo upload support using Supabase Storage
- Listings save to Supabase as `pending`
- Public page only displays `approved` listings
- Demo mode works without Supabase keys, but listings do not save permanently

## Setup

### 1. Create a Supabase project

Go to Supabase and create a free project.

### 2. Run the database setup

Open Supabase SQL Editor and paste/run:

```sql
supabase/schema.sql
```

### 3. Copy your Supabase keys

In Supabase:

- Project Settings
- API
- Copy Project URL
- Copy anon/public key

### 4. Add environment variables

Create `.env` locally or add these in Vercel:

```txt
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 5. Install and run locally

```bash
npm install
npm run dev
```

### 6. Deploy to Vercel

- Create a free Vercel account
- Import this project or drag/drop it
- Add the two environment variables in Vercel
- Deploy

## Approving listings

Parent submissions are saved as `pending`.

To make them public:

1. Go to Supabase
2. Open Table Editor
3. Open `listings`
4. Change `status` from `pending` to `approved`

To remove or hide a listing, change status to `sold` or `rejected`.

## Notes

This is an MVP. Future upgrades could include admin login, automatic approval emails, seller accounts, payments, and sold badges.
