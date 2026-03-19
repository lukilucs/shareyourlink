# AGENTS.md

Operational guide for coding agents working in `shareyourlink`.

## 1) Project Snapshot

- Stack: Next.js 16 (App Router), React 19, TypeScript 5, Prisma 7, PostgreSQL.
- Package manager signal: `bun.lock` exists (Bun preferred), but `npm` also works.
- Linting: ESLint 9 with `eslint-config-next` (`core-web-vitals` + `typescript`).
- Type checking: TypeScript `strict: true`, `noEmit: true`.
- i18n: `next-intl` configured via `next.config.ts` and `i18n/routing.ts`.

## 2) Source Layout (Important Paths)

- `src/app/[locale]/...` - App Router routes.
- `src/actions/` - Server Actions (`"use server"`).
- `src/lib/` - Shared server utilities (`db`, hashing, code generation).
- `prisma/schema.prisma` - Data model and client generation config.
- `src/generated/prisma/` - Generated Prisma client output.
- `messages/*.json` - Translation messages.
- `eslint.config.mjs` - Lint configuration.
- `tsconfig.json` - Compiler and path alias (`@/* -> src/*`).

## 3) Repo Rules Files

The following rule files were checked:

- `.cursor/rules/` - not present.
- `.cursorrules` - not present.
- `.github/copilot-instructions.md` - not present.

Implication for agents:

- Follow this `AGENTS.md` + repository configs (`eslint.config.mjs`, `tsconfig.json`, Prisma schema).
- Do not invent additional hidden project-specific rules.

## 4) Build / Lint / Test Commands

Use Bun commands by default (lockfile present). npm alternatives are provided.

### Install

- `bun install`
- `npm install`

### Run Dev Server

- `bun run dev`
- `npm run dev`

### Build for Production

- `bun run build`
- `npm run build`

### Start Production Server

- `bun run start`
- `npm run start`

### Lint

- `bun run lint`
- `npm run lint`

### Type Check (explicit)

- `bunx tsc --noEmit`
- `npx tsc --noEmit`

### Prisma (common local workflow)

- Generate client: `bunx prisma generate`
- Create migration: `bunx prisma migrate dev --name <name>`
- Apply migrations: `bunx prisma migrate deploy`
- Open Studio: `bunx prisma studio`

### Tests (Current State)

There is currently no test runner configured in `package.json` (no `test` script, no Jest/Vitest config detected).

- Full test suite: not available yet.
- Single test execution: not available yet.

If a runner is added later, prefer these patterns:

- Vitest single file: `bunx vitest run path/to/file.test.ts`
- Vitest single test name: `bunx vitest run -t "test name"`
- Jest single file: `bunx jest path/to/file.test.ts`
- Jest single test name: `bunx jest -t "test name"`

## 5) Required Pre-PR Verification

Before opening a PR or finalizing substantial edits, run:

1. `bun run lint`
2. `bunx tsc --noEmit`
3. `bun run build`

If Bun is unavailable, use npm/npx equivalents.

## 6) Code Style Guidelines

These rules reflect the existing codebase and configs.

### 6.1 Language, Modules, and Files

- Use TypeScript (`.ts` / `.tsx`) for all new source files.
- Use ESM `import`/`export` syntax.
- Prefer named exports for shared utilities.
- Keep files focused: one primary responsibility per file.

### 6.2 Imports

- Order imports in three groups (top to bottom):
  1) framework/external packages
  2) internal aliases (`@/...`)
  3) relative imports (`./`, `../`)
- Keep a blank line between groups when it improves readability.
- Prefer alias imports (`@/*`) over deep relative traversal when possible.
- Remove unused imports immediately (ESLint enforces this indirectly).

### 6.3 Formatting

- Follow ESLint autofix output when available.
- Match existing formatting conventions:
  - semicolons required
  - double quotes for strings
  - trailing commas where valid
- Keep lines readable; avoid dense one-liners in business logic.

### 6.4 Types and Type Safety

- Respect `strict: true`; avoid bypassing types.
- Avoid `any`; use exact types, unions, or generics.
- Add explicit return types for exported functions.
- Validate nullable values from runtime sources (`FormData`, headers, env vars).
- Prefer `Readonly` props for React components when applicable.

### 6.5 Naming Conventions

- Variables/functions: `camelCase`.
- Components/types/interfaces/classes: `PascalCase`.
- Constants: `UPPER_SNAKE_CASE` only for true constants.
- Filenames:
  - route files follow Next.js conventions (`page.tsx`, `layout.tsx`)
  - utility modules use lowercase kebab or short lowercase names.
- Prisma model names should follow existing schema conventions unless a migration deliberately changes them.

### 6.6 React and Next.js

- Prefer Server Components by default; use Client Components only when needed.
- Put server-only logic in Server Actions or server modules.
- Do not import server-only modules into Client Components.
- Use `next-intl` routing conventions for locale-aware navigation.

### 6.7 Error Handling and Validation

- Validate all external input at boundaries (forms, params, headers, env).
- Fail with clear, user-safe messages; avoid leaking internal details.
- In server actions, return structured results consistently (e.g., `{ success, ... }` or `{ error }`).
- Log internal errors when useful for debugging, but avoid exposing secrets.
- Use early returns for invalid states to keep flow simple.

### 6.8 Data and Database Access

- Use the shared Prisma singleton from `src/lib/db.ts`.
- Keep DB access in server context only.
- Select only needed fields in queries when practical.
- When introducing schema changes, include migration + regenerated client.

### 6.9 Security and Privacy

- Never commit secrets or real credentials.
- Read secrets from environment variables.
- Treat IPs, tokens, and URLs as sensitive inputs; sanitize and validate.
- Prefer secure-by-default handling for links and identifiers.

### 6.10 Comments and Documentation

- Keep comments minimal and high-value.
- Explain non-obvious intent, not obvious syntax.
- Keep docs and code examples aligned with actual commands in this repo.

## 7) Agent Workflow Expectations

- Make minimal, targeted edits; avoid broad refactors unless requested.
- Preserve existing architecture and naming patterns.
- Do not silently change tooling choices (lint/type/test/build) without rationale.
- If you add a test framework, update this file with exact single-test commands.
- If `.cursor` or Copilot instruction files are later added, merge their constraints into this guide.

## 8) Quick Command Reference

- `bun install`
- `bun run dev`
- `bun run lint`
- `bunx tsc --noEmit`
- `bun run build`
- `bun run start`
- `bunx prisma generate`
- `bunx prisma migrate dev --name <name>`
