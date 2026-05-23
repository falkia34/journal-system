# Architecture

## Overview

Journal System follows **Clean Architecture** with **Inversify Dependency Injection**, organized into four layers with strict dependency rules.

```
domain/ ← application/ ← infrastructure/ | presentation
```

## Layer Responsibilities

| Layer | Location | Responsibility | Dependencies |
|-------|----------|---------------|-------------|
| **Domain** | `src/domain/` | Entities, repository interfaces, custom errors | Zero external deps |
| **Application** | `src/application/` | Use cases (one file per operation) | Domain only |
| **Infrastructure** | `src/infrastructure/` | Repository impls, DTOs, data sources (Prisma, better-auth) | Domain + external libs |
| **Presentation** | `src/presentation/` | React components, server actions, stores, hooks | Application + infrastructure |

## Dependency Injection

Two Inversify containers serve different rendering contexts:

- **`serverContainer`** (`src/server-injection.ts`) — Used in RSC pages, server actions, route handlers, and `proxy.ts`. All Prisma-bound use cases resolved here.
- **`clientContainer`** (`src/client-injection.ts`) — Used in client components for auth operations and sidebar state.

All DI symbols live in `config/symbols.ts` using the `SYMBOLS.XxxUseCase` naming convention.

## Data Flow

### Read (Server Component → Client Component)

```
page.tsx (async server component)
  → serverContainer.get<GetJournals>(SYMBOLS.GetJournals)
  → useCase.execute(include, filter, sort, pagination)
  → match(result, { onLeft: throw, onRight: data })
  → JournalMapper.fromDomainToDto(journals)
  → <JournalsList journals={dtos} />  (client component)
```

### Write (Client Component → Server Action → Use Case)

```
Client form submits
  → startTransition(() => createJournalAction(prevState, formData))
  → 'use server' action resolves use case from serverContainer
  → Zod schema validates input
  → useCase.execute(data)
  → revalidateTag('journals')
  → redirect('/admin/journals')
```

## DTO Boundary

Domain entities **never** cross the server/client boundary. The DTO layer (`src/infrastructure/dtos/`) provides:

- **`*Mapper.fromDomainToDto()`** — Serializes domain entities for client consumption (snake_case keys, ISO date strings)
- **`*Mapper.fromDtoToDomain()`** — Reconstructs domain entities from DTOs (camelCase, Date objects)
- **`*Mapper.fromPrismaToDomain()`** — Maps Prisma records to domain entities in repository impls

## Server Actions

All CRUD mutations go through Next.js server actions in `src/presentation/actions/`. This is necessary because use cases depend on Prisma (server-only). Actions:

1. Validate input with Zod schemas from `src/presentation/schemas/`
2. Resolve use cases from `serverContainer`
3. Execute and handle `Either` results
4. Call `revalidateTag()` for cache invalidation
5. Call `redirect()` on success

## Authentication

- **better-auth** with **Google OAuth** social login
- Server config: `src/infrastructure/datasources/auth-server.data-source.ts`
- Client config: `src/infrastructure/datasources/auth-client.data-source.ts`
- Route handler: `app/(auth)/auth/[...all]/route.ts`
- Proxy (middleware): `proxy.ts` — validates session, redirects unauthenticated users to `/login`
- User info retrieved from Prisma `users` table via `GetSession` use case

## Role-Based Routing

Users can have multiple roles (Author, Reviewer, Editor, Administrator). The system uses route groups:

| Role | Route Prefix |
|------|-------------|
| Administrator | `/admin` |
| Editor | `/editor` |
| Reviewer | `/reviewer` |
| Author | `/author` |

The navbar includes a **role selector** for users with multiple roles. The sidebar dynamically renders menus based on the active role.

## State Management

**Zustand** with Immer middleware and sliced pattern:

- **Session slice**: `session`, `activeRole`, `setActiveRole()`
- **Sidebar slice**: `sidebarOpened`, `sidebarExtended`, `sidebarHovered` + actions

The `InternalStoreProvider` hydrates the store from server-passed session data.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| ORM | Prisma 7.x + PostgreSQL |
| DI | Inversify + reflect-metadata |
| UI | MUI v7 + Tailwind CSS v4 |
| State | Zustand + Immer |
| Forms | React Hook Form + Zod |
| Auth | better-auth + Google OAuth |
| HTTP | Axios |
