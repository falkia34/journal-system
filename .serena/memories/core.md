# Core Project Structure
- `app/`: Next.js App Router. Contains routing and page layouts.
- `src/`: Core application logic (domain, application, infrastructure, presentation).
- `config/`: App-wide configurations, Inversify DI container bindings (`symbols.ts`).
- `prisma/`: Prisma schema and migrations.
- `types/`: Global TS declarations.

See `mem:tech_stack` for technology details and `mem:conventions` for code structure invariants.