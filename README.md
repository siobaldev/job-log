# Job Log

## Description

ob Log is a personal job-application tracker and automation tool. Paste
a job posting, and it extracts the company, role, location, salary, and
requirements automatically. Every entry is tracked through a status
pipeline (Saved → Applied → Interview → Offer/Rejected), with a tailored
application email and optional cover letter generated per job, in a
tone you choose: casual, semi-formal, or formal.

The project also doubles as a public portfolio piece: it runs a public
demo profile with sample data for anyone to try. The real, owner-only
profile (gated behind a single authenticated account) uses live data
and a different AI provider under the hood, without exposing real
job-search data or API costs to visitors.

## Tech Stack

**Frontend**

- [Nuxt 4](https://nuxt.com) — Vue 3, Composition API, `<script setup>`
- [Tailwind CSS v4](https://tailwindcss.com) — CSS-first config via `@theme`, no `tailwind.config.ts`
- [reka-ui](https://reka-ui.com) — unstyled, accessible component primitives
- [vee-validate](https://vee-validate.logaretm.com) + [Zod](https://zod.dev) — form state and schema validation

**Backend / Data**

- [Supabase](https://supabase.com) — Postgres database, Auth, and file storage
- Nuxt server routes (Nitro) — server-side AI calls, keeping API keys off the client

**Tooling**

- [pnpm](https://pnpm.io) — package manager
- [Vitest](https://vitest.dev) + [@nuxt/test-utils](https://nuxt.com/docs/getting-started/testing) + [@vue/test-utils](https://test-utils.vuejs.org) — testing
- [ESLint](https://eslint.org) (`@nuxt/eslint`) — linting
- GitHub Actions — lint runs on every pull request
