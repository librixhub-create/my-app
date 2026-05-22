# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Type-check and build for production
npm run lint     # Run ESLint
npm run start    # Start production server (after build)
```

There are no tests configured. `npm run build` is the primary correctness check — it runs the TypeScript compiler across the full app.

## Stack & Critical Constraints

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — configuration is CSS-only via `@theme` block in `app/globals.css`. The `tailwind.config.ts` file exists but is **not the active config source**. Never add custom colors or fonts there — they must go in `globals.css`.
- **Supabase** via `@supabase/ssr` — two distinct clients exist and must not be mixed:
  - `lib/supabase/server.ts` → used in Server Components and Route Handlers (reads cookies)
  - `lib/supabase/client.ts` → used in Client Components (`"use client"`)
- **Recharts** for all charts. No other UI component libraries are used — no shadcn, no MUI.

## Design System

All design tokens live in `app/globals.css` as CSS variables under `@theme`. The utility classes they generate:

| Class | Value |
|---|---|
| `bg-bg` | `#06070F` (page background) |
| `bg-sidebar` | `#0B0D1A` |
| `bg-card` | `#0F1120` |
| `border-border` | `#1A1D2E` |
| `text-gold` / `bg-gold` | `#C49832` (primary accent) |
| `text-text` | `#E8E9F0` |
| `text-muted` | `#6B7280` |
| `text-success/error/warning/info` | green/red/amber/blue |

Reusable component classes defined via `@layer components`: `.card`, `.btn-primary`, `.btn-ghost`, `.input`, `.badge`, `.table-row-hover`.

Fonts: `font-outfit` (body) and `font-cormorant` (logo/headings), loaded via `next/font/google` in `app/layout.tsx`.

## Architecture

### Route Structure

```
app/
├── page.tsx                    → redirects to /dashboard
└── (main)/                     → route group — all pages share Sidebar layout
    ├── layout.tsx
    ├── dashboard/
    ├── clientes/
    ├── projetos/               → Kanban board (4 columns: briefing/producao/revisao/entrega)
    ├── kdp/                    → Amazon KDP publications grid
    ├── financeiro/             → Full financial module (3 tabs)
    └── config/
```

Each route follows the same split pattern: a **Server Component** `page.tsx` that fetches data from Supabase, then passes it to a **Client Component** `*Client.tsx` or `*Client.tsx` that owns all state and interactivity.

### Data Flow

Server components call `createClient()` from `lib/supabase/server.ts` and pass data as props to client components. Client components call `createClient()` from `lib/supabase/client.ts` for mutations (insert/update/delete). Optimistic UI updates are done locally via `useState` setters — there is no global state manager or SWR/React Query.

### Financial Module (most complex)

`app/(main)/financeiro/` is the most complex module. Key concepts:

- **`payments`** is the parent record (total, method, type).
- **`payment_installments`** is what's actually displayed and acted upon — each payment generates 1 or 2 installment rows.
- The default installment model is **50/50**: Entrada 50% + Saldo 50%. The Saldo is locked (cannot be marked paid) until the Entrada is paid. This lock is checked at render time in `FinanceiroClient.tsx` by scanning sibling installments with the same `payment_id`.
- `NewPaymentModal` creates both the `payments` row and the `payment_installments` rows in one flow.
- `MarkAsPaidModal` updates a single `payment_installments` row.

### Database Schema

Six tables in Supabase PostgreSQL (see `supabase/migrations/001_initial.sql`):

- `clients` → root entity, all others reference it
- `projects` → FK to clients; `status` drives the Kanban columns
- `kdp_publications` → FK to clients + projects
- `payments` → FK to clients + projects; parent of installments
- `payment_installments` → FK to payments + clients; the atomic financial unit
- `tasks` → FK to clients + projects

Cascade rules: deleting a client cascades to projects, kdp_publications, payments, payment_installments, and tasks.

Seed data: `supabase/seed.sql` — 26 clients + 5 payment examples with installments.

### Shared Utilities

- `lib/types.ts` — all TypeScript interfaces and union types
- `lib/utils.ts` — `formatCurrency(amount, currency)`, `formatDate(date)`, `getStatusColor(status)`, `getStatusLabel(status)`, `getInitials(name)`
- `components/ui/Avatar.tsx` — deterministic color from name hash; shows 2-letter initials
- `components/ui/Modal.tsx` — base modal with Escape-key close and backdrop click
