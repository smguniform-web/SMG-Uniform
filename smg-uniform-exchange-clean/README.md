# SMG Uniform Exchange

Deploy-ready Vite + React + Supabase project.

## Environment variables for Vercel

VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY

## Supabase

Run `supabase/schema.sql` in Supabase SQL Editor.

Listings submitted by parents are saved as `approved = false`.
To show a listing publicly, open Supabase table editor and set `approved` to `true`.
