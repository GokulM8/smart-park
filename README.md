# Welcome

## Project info

**URL**: [smart-park-green-eight.vercel.app](https://smart-park-green-eight.vercel.app)

# Smart Park Hub

Smart Park Hub is a Vite + React + TypeScript web application for managing parking slots, vehicles, entry/exit logs, billing and reports. It integrates with Supabase for authentication, storage and row-level security.

## Key features

- User authentication (Supabase)
- Vehicle management (per-user)
- Parking slot management with availability and reservations
- Entry/exit logging and billing/invoice generation
- Admin reports and analytics
- Real-time updates via Supabase Realtime

## Tech stack

- Frontend: React, TypeScript, Vite
- UI: Tailwind CSS, shadcn-ui components (Radix primitives)
- State & data: Zustand, @tanstack/react-query
- Backend: Supabase (Postgres, Auth, Realtime)
- Tests: Vitest + Testing Library

## Prerequisites

- Node.js (recommended LTS) and npm
- A Supabase project (see `SUPABASE_SETUP.md`)

## Quickstart

1. Clone the repo

```bash
git clone <your-repo-url>
cd smart-park-hub
```

2. Install dependencies

```bash
npm install
```

3. Add environment variables (create `.env.local` in project root)

Required:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

4. Start development server

```bash
npm run dev
```

Open http://localhost:5173 (or the address printed by Vite).

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run build:dev` — build in development mode
- `npm run preview` — preview production build
- `npm run lint` — run ESLint
- `npm run test` — run tests (Vitest)
- `npm run test:watch` — run tests in watch mode

These are defined in `package.json`.

## Supabase

This project stores database schema and migrations in the `supabase/migrations` folder. Follow `SUPABASE_SETUP.md` to create a Supabase project, set the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars, and apply migrations.

Common tasks:

- Run locally with your Supabase project configured in `.env.local`.
- Use the Supabase dashboard SQL editor to run migration SQL files (or use the Supabase CLI to push migrations).

## Project structure (high-level)

- `src/` — application source code
	- `components/` — UI components and shadcn-ui wrappers
	- `hooks/` — custom hooks (e.g., `use-supabase`, `use-mobile`)
	- `lib/` — app-level utilities and stores (Supabase client, auth store)
	- `pages/` — route pages (Dashboard, Vehicles, Admin, etc.)
	- `test/` — unit and integration tests
- `supabase/` — migrations and SQL used to setup the database

## Testing

Run unit and integration tests using Vitest:

```bash
npm run test
npm run test:watch
```

## Linting

```bash
npm run lint
```

## Development notes

- The app uses Vite and React with SWC plugin for fast HMR.
- Tailwind CSS is configured; edit `tailwind.config.ts` and `src/index.css`.
- Types for Supabase tables are generated into `src/types/supabase.ts` (see migrations for schema).

## Deploying

You can deploy the built `dist/` to any static host that supports single-page apps. The recommended flow is:

```bash
npm run build
npm run preview
```

For seamless Supabase integration use Vercel, Netlify, or Supabase Hosting and make sure environment variables are configured there too.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Run tests and linters
4. Open a pull request with a clear description

## Troubleshooting

- If you see authentication or database errors, confirm `.env.local` contains correct Supabase values and restart the dev server.
- If migration SQL fails, run them in the Supabase dashboard SQL editor to get clearer errors.

## Resources

- Supabase docs: https://supabase.com/docs
- Vite docs: https://vitejs.dev
- Tailwind docs: https://tailwindcss.com

---

License: See repository settings for license information.
