# AGENTS.md

## Next.js 16 — Breaking Changes

This project uses **Next.js 16**, which has significant breaking changes from 14/15. Read the bundled docs before writing any code:

- Upgrade guide: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`
- CSS-in-JS with MUI: `node_modules/next/dist/docs/01-app/02-guides/css-in-js.md`
- Instant navigation: `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`

Key Next.js 16 changes an agent will likely get wrong:

- **Turbopack is default** for `dev` and `build`. No `--turbopack` flag needed. Use `--webpack` to opt out.
- **Async request APIs**: `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are now **async-only**. Always `await` them. Use `PageProps<'/route/path'>` type helper.
- **`middleware.ts` → `proxy.ts`**: The file is renamed. Runtime is `nodejs` only (no `edge`).
- **`next lint` removed**: Use ESLint CLI directly (`eslint`).
- **`cacheLife`/`cacheTag` stable**: No more `unstable_` prefix. `revalidateTag()` now requires a second `cacheLife` argument. New `updateTag()` for immediate cache invalidation.
- **`unstable_instant`**: Export this from routes that should navigate instantly. It validates caching/Suspense structure at dev and build time.

## Commands

```bash
npm run dev        # Start dev server (Turbopack by default)
npm run build      # Production build (Turbopack by default)
npm run lint       # ESLint check
npm run format     # ESLint --fix
npx prisma migrate dev   # Run Prisma migrations
npx prisma generate      # Regenerate Prisma client
npx prisma studio        # Prisma DB browser
npx next typegen         # Generate PageProps/LayoutProps types
```

## Architecture — Clean Architecture with Inversify DI

Follows the pattern from [infinity-frontend](https://github.com/infiniteuny/infinity-frontend):

```
app/                    # Next.js App Router (thin routing layer only)
  (auth)/               # Auth routes (login, callbacks)
  (internal)/           # Authenticated routes (dashboard, submissions)
  (public)/             # Public routes (journal pages, health check)
config/                 # App-wide config
  symbols.ts            # Inversify DI symbol registry (SYMBOLS.XxxUseCase, etc.)
  themes.ts             # MUI M3 theme config
  fonts.ts              # next/font definitions
  index.ts              # App metadata, nav, sidebar config
src/
  domain/               # Entities, repository interfaces, errors (ZERO external deps)
    entities/           # Domain models (article, review, user, journal, etc.)
    repositories/        # Interface-only contracts (*.repository.ts)
    errors/              # Custom error types
    index.ts             # Barrel export
  application/          # Use cases — one file per use case
    submit-article.ts
    get-article.ts
    create-review.ts
    index.ts
  infrastructure/        # Concrete implementations
    datasources/         # API clients, DB access (Prisma data sources)
    repositories/        # Repository impls (*.repository-impl.ts)
    dtos/                # Data Transfer Objects (API ↔ domain mapping)
  presentation/          # UI layer
    components/          # React components by scope
    controllers/         # Presentation logic controllers
    hooks/               # Custom React hooks
    stores/              # Zustand state stores
    styles/              # Global CSS
  server-injection.ts   # Server-side DI container (composition root)
  client-injection.ts   # Client-side DI container (composition root)
types/                  # Global TypeScript declarations (augment MUI, etc.)
```

**Dependency rule**: `domain` ← `application` ← `infrastructure`/`presentation`. Never import infrastructure from domain. Composition roots (`server-injection.ts`, `client-injection.ts`) wire bindings.

## Key Patterns

### Inversify DI

- All DI symbols defined in `config/symbols.ts` — use `SYMBOLS.XxxUseCase` when binding or resolving
- `reflect-metadata` **must** be imported at the very top of injection files, before any Inversify `@injectable()`/`@inject()` decorators
- TypeScript `experimentalDecorators` and `emitDecoratorMetadata` must be enabled in `tsconfig.json`
- Two containers: `server-injection.ts` (for RSC/server-side) and `client-injection.ts` (for client components)

### Use Cases

- One file per use case in `src/application/`
- Naming: `verb-entity.ts` (kebab-case) — e.g., `submit-article.ts`, `get-reviews.ts`
- Each use case receives repository interfaces via Inversify DI

### Repositories

- **Contracts** in `src/domain/repositories/` — e.g., `article.repository.ts`
- **Implementations** in `src/infrastructure/repositories/` — e.g., `article.repository-impl.ts`

### DTOs

- In `src/infrastructure/dtos/` — map between API response shapes and domain entities

### Route Groups

- `app/(auth)/` — login, auth callbacks (no sidebar layout)
- `app/(internal)/` — authenticated dashboard pages (with sidebar)
- `app/(public)/` — journal public pages, health check

### Prisma

- Output: `src/generated/prisma` (configured in `prisma/schema.prisma`)
- Datasource URL: from `DATABASE_URL` env var (configured in `prisma.config.ts`)
- Import: `import { PrismaClient } from '@/src/generated/prisma'`
- Prisma 7.x uses `prisma-client` provider (not `prisma-client-js`)

## Tech Stack

| Layer      | Technology                                                                    |
| ---------- | ----------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)                                            |
| ORM        | Prisma 7.x with PostgreSQL                                                    |
| DI         | Inversify + reflect-metadata                                                  |
| UI         | MUI v7 (Material UI) + Tailwind CSS v4                                        |
| State      | Zustand                                                                       |
| Forms      | React Hook Form + Zod                                                         |
| Validation | Zod + validator                                                               |
| HTTP       | Axios                                                                         |
| TS         | Strict mode, decorators enabled, `@app/*` → `src/*`, `@config/*` → `config/*` |

### MUI + Tailwind v4 Coexistence

- Tailwind CSS v4 uses CSS-first config (`@import "tailwindcss"` in globals.css, `@tailwindcss/postcss` plugin). No `tailwind.config.js`.
- MUI requires an Emotion-style registry for SSR (`useServerInsertedHTML` hook). See the CSS-in-JS guide.
- Prettier should sort Tailwind classes inside MUI `sx` attributes.

## Journal System Domain

This is an Open Journal Systems (OJS)-like platform:

- **Authors** submit articles to journals
- **Reviewers** are assigned and submit peer reviews
- **Authors** submit revisions based on review feedback
- **Editors** manage the workflow and publish accepted articles
- Key entities: Journal, Article, Review, Revision, User, Editor

## TypeScript Conventions (enforced by build)

- **`isolatedModules` + `emitDecoratorMetadata`**: When these are both enabled, interface types used in decorator signatures must be imported with `import type`, not `import`. Example: `import type { IArticleRepository } from '@app/domain'`.
- **Barrel exports of interfaces**: Use `export type { ... }` in barrel files (e.g., `repositories/index.ts`, `dtos/index.ts`), not `export { ... }`. Otherwise the build fails with "Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'".
- **Path aliases**: `@app/*` → `./src/*`, `@config` → `./config/index.ts`, `@config/*` → `./config/*`. Already configured in `tsconfig.json` — do NOT use `@/*`.
- **`reflect-metadata` in `types`**: `tsconfig.json` includes `"types": ["reflect-metadata"]` so decorators resolve correctly.
- **`@config` imports**: `import { SYMBOLS } from '@config'` works because `config/index.ts` re-exports from `symbols.ts`.

## Environment

- `DATABASE_URL` — PostgreSQL connection string (in `.env`, gitignored)
- `.env*` patterns are gitignored

## Git Conventions

- Default branch: `develop`
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `ci:`
- Scope recommended: `feat(article): add submission form`

## Pinned Dependencies (as of scaffolding)

Key versions — do not bump without checking breaking changes:

| Package | Version |
|---------|---------|
| next | 16.2.4 |
| react / react-dom | 19.2.4 |
| @prisma/client / prisma | 7.8.0 |
| inversify | 6.2.2 |
| reflect-metadata | 0.2.2 |
| @mui/material | 7.3.10 |
| @mui/icons-material | 7.3.10 |
| @emotion/react | 11.14.0 |
| @emotion/styled | 11.14.0 |
| zustand | 5.0.5 |
| react-hook-form | 7.56.4 |
| @hookform/resolvers | 5.1.1 |
| zod | 3.25.67 |
| axios | 1.9.0 |
| validator | 13.15.15 |
| immer | 11.1.4 |
| styled-components | 6.1.19 |
| tailwindcss | 4.2.4 |
