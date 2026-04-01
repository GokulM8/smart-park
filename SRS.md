# Software Requirements Specification (SRS)

Project: Smart Park Hub

Date: 2026-04-01

Author: Project maintainers

---

## Overview

Smart Park Hub is a Single Page Application (SPA) for managing parking slots, vehicles, entry/exit logs, billing, and reports. The frontend uses Vite + React + TypeScript and Tailwind; the backend uses Supabase (Postgres, Auth, Realtime). This document defines functional and non-functional requirements, interfaces, data model, constraints, assumptions, and acceptance criteria for development and QA.

## 1. Introduction

- **Purpose**: Provide a single-source SRS to guide implementation, testing, deployment, and maintenance of Smart Park Hub.
- **Audience**: Product owner, developers, testers, DevOps, maintainers.
- **Scope**: Frontend SPA, Supabase backend (database, auth, realtime), migrations in `supabase/migrations/`, CI/CD and deployment to a static host (Vercel/Netlify).

## 2. Definitions & Acronyms

- RLS: Row Level Security (Postgres/Supabase)
- SPA: Single Page Application
- Admin: Elevated user with global management privileges

## 3. System Overview

- Frontend: `src/` (React components, Tailwind, shadcn-ui wrappers)
- Backend: Supabase (Auth, Postgres, Realtime)
- Migrations: `supabase/migrations/`
- State & data: Zustand + @tanstack/react-query
- Tests & lint: Vitest and ESLint

## 4. Stakeholders

- End users: manage vehicles, view/fill slots, check entry/exit and billing
- Admins: manage slots, users, and generate reports
- Developers/Operators: implement features, run CI, manage deployments and DB migrations

## 5. Functional Requirements (FR)

Each requirement has a short ID for traceability.

- FR-1: Authentication
  - Users can sign up, sign in, sign out via Supabase Auth; password reset supported.

- FR-2: User Profile
  - Users can view and edit profile fields.

- FR-3: Vehicle Management
  - Users can add, edit, delete vehicles.
  - `FR-3.1`: Vehicle identifiers (e.g., plate number) must be unique per user.

- FR-4: Parking Slot Management
  - Admins can create/configure slots; users can view availability; optional reservation flow.

- FR-5: Slot Ownership & Access
  - Slot operations are scoped to owning user by default (RLS); Admins may manage all.

- FR-6: Entry/Exit Logging
  - Record vehicle entry and exit timestamps with references to user, vehicle, and slot; allow authorized corrections.

- FR-7: Billing & Invoicing
  - Generate bills from entry/exit logs using configurable rates; users can view invoices and history.

- FR-8: Reports & Analytics
  - Admins can generate utilization, revenue, and activity reports with date-range filters and CSV export.

- FR-9: Real-time Updates
  - Slot availability and entry/exit events propagate in real-time with Supabase Realtime.

- FR-10: Validation & Constraints
  - DB-level constraints to enforce uniqueness and referential integrity (see migrations).

- FR-11: Notifications
  - In-app notifications for important events (e.g., billing notices, slot assignments).

- FR-12: Admin Tools
  - Admin UI for user and system management, migrations and settings.

## 6. Non-Functional Requirements (NFR)

- NFR-1: Security
  - Use Supabase Auth and RLS; production must run over HTTPS.

- NFR-2: Performance
  - Initial page load <= 2s on broadband; common API responses <= 500ms under typical load.

- NFR-3: Scalability
  - Frontend scales horizontally; backend depends on Supabase plan.

- NFR-4: Reliability
  - Graceful degradation when Supabase is unavailable; clear error messages.

- NFR-5: Maintainability
  - Code follows lint rules; tests for key flows; CI runs lint + tests.

- NFR-6: Accessibility
  - UI to follow basic WCAG AA guidelines for primary flows.

- NFR-7: Privacy & Compliance
  - Store minimal personal data; secrets in environment variables.

## 7. External Interfaces

- Supabase: Auth, Postgres, Realtime, Storage. Migrations are in `supabase/migrations/`.
- Hosting/CI: Vercel/Netlify for static hosting; GitHub Actions for CI (recommended).
- Third-party libraries: Radix/shadcn UI, `@supabase/supabase-js`, `react-router-dom`, etc.

## 8. Data Model (high-level)

- Users: `id`, `email`, `profile_*`
- Vehicles: `id`, `user_id`, `plate_number`, `make`, `model`, `metadata`
- Slots: `id`, `owner_id` (nullable), `slot_number`, `status`, `location`
- EntryExitLogs: `id`, `vehicle_id`, `slot_id`, `entry_time`, `exit_time`, `billed_amount`, `status`
- Invoices: `id`, `user_id`, `period_start`, `period_end`, `amount`, `status`

DB schema and constraints should match files in `supabase/migrations/` (e.g., `003_park_tables.sql`).

## 9. Constraints

- Frontend is built with Vite; Node.js + npm required for local dev.
- Database is Supabase/Postgres; RLS policies must be applied via migrations or dashboard.

## 10. Assumptions

- Supabase project and credentials will be provided via `.env.local` (e.g., `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
- Admin role(s) are managed in DB or via Supabase metadata.
- Billing rules are configurable in-app or stored in DB.

## 11. Acceptance Criteria

- Users can sign up, add a vehicle, record entry and exit, and view billing for a recent period.
- Admins can add slots, generate utilization reports for a date range, and export CSV.
- `npm run build` completes without errors; `npm run test` and `npm run lint` pass in CI.

## 12. Traceability & Prioritization

- Must-have: FR-1, FR-3, FR-4, FR-6, FR-10.
- Should-have: FR-7, FR-8, FR-9.
- Nice-to-have: FR-11, extended analytics and alerts.

## 13. Risks

- Misconfigured RLS may expose user data — requires DB policy review.
- Billing accuracy depends on correct timestamps and consistent data.
- Real-time features depend on Supabase service availability and plan limits.

## 14. Next Steps

1. Review and approve this SRS.
2. Create issues for each FR with acceptance tests.
3. Add CI workflow to run `npm run lint` and `npm run test` on PRs.
4. (Optional) I can open a PR adding this file and/or create the issues.

---

If you want, I will commit and push this file now and open issues for the FRs.
