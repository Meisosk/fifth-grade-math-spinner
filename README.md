# fifth-grade-math-spinner

A classroom name spinner. Type names into the list, spin, and the picked name sits out the next 3 spins: it stays on the wheel but can't be picked. **Reset** makes everyone pickable again. Sitting out can be turned off in the settings.

- On load, a popup asks which profile is spinning: **4B** or **5Math** (each has its own names saved to Supabase) or **Anonymous** (nothing saved).
- Spin history and cooldowns are in memory only. A refresh clears them, and only the saved profiles' names come back.

Built from [sosk-scaf](https://github.com/Meisosk/sosk-scaf); its sign-in, admin dashboard and analytics were removed.

## Setup

1. `npm install`
2. Fill in `.env` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT`). Each line's comment says where to find the value.
3. Run [supabase/schema.sql](supabase/schema.sql) once in the Supabase **SQL Editor**. It creates the `name_lists` table and the 4B and 5Math rows.

## Running

```bash
npm run dev       # API server + Vite together (dev:web runs Vite alone)
```

Vite proxies `/api` to the Express server on `PORT`, so the server must be running for saved profiles' names to load and save.

## Deploying (Netlify)

`netlify.toml` holds the build settings, sends `/api/names/*` to the Netlify Function, and serves `index.html` for every other path. In **Site configuration → Environment variables**, set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (the `VITE_` values aren't needed).

## Structure

```
src/
├── pages/SpinnerPage.tsx          → the whole app: state, layout, names, sitting out
├── components/SpinHistory.tsx     → fading, scrollable list of picks (left column)
├── components/SpinnerWheel.tsx    → SVG wheel, rotated by the page to animate a spin
├── components/UserPickerDialog.tsx→ "Who's spinning?" popup
├── lib/cooldowns.ts               → sit-out rules (SIT_OUT_SPINS = 3)
└── lib/names.ts                   → users list + API calls for saved names

server/names.js                    → get/save names in Supabase (service role key, saved profiles only)
server/index.js                    → local Express API for `npm run dev`
netlify/functions/names.mjs        → the same API on Netlify
supabase/schema.sql                → name_lists table (RLS on, no policies; server-only access)
```

To add another saved profile, add the name to `SAVED_USERS` in both `src/lib/names.ts` and `server/names.js`, then insert a row into `name_lists`.
