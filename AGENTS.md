<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key guides before writing code:
- `01-app/01-getting-started/05-server-and-client-components.md` — server vs client component rules
- `01-app/02-guides/server-and-client-boundary.md`
- `01-app/02-guides/server-actions.md` — server action contract
- `01-app/01-getting-started/07-mutating-data.md` — plus `01-app/02-guides/forms.md`
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:repo-conventions -->
# Repo Conventions (verified against this codebase, Sept 2026)

## Stack
- **Next.js 16** (App Router, React server actions) + **React 19**, TypeScript strict, `reactCompiler: true` in `next.config.ts`.
- **Tailwind v4** (PostCSS `@tailwindcss/postcss`, `@theme inline` tokens in `src/app/globals.css`, `@import "tailwindcss"`).
- **Prisma 7** + `@prisma/adapter-pg` (Pg driver adapter), generated client committed under `prisma/generated/prisma`.
- **better-auth** with Prisma adapter; session extended (via `customSession`) to carry `roles` + `permissions`.
- **shadcn-style UI**: `radix-ui` + `@base-ui/react` primitives, `cva`, `clsx`, `tailwind-merge` (see `src/components/ui/`, `components.json`).
- **Forms**: `react-hook-form` + `zodResolver`. **Client data**: `@tanstack/react-query`. **Toasts**: `sonner`.
- **Payments**: `midtrans-client` (Snap) + `axios`. **Icons**: `react-icons/pi` (Phosphor), `lucide-react` for spinners.

## Import aliases
- `@/*` → `./src/*` (also `@/components`, `@/lib`, `@/utils`).
- `@/generated/*` → `./prisma/generated/prisma/*` — **Prisma client and types come from here, never from `@prisma/client`.** Import `include`/`select` payloads with `Prisma.XGetPayload` and query builders via `Prisma.validator`.

## Folder conventions
```
src/app/(public)/auth/            public pages (login)
src/app/(protected)/home/         authenticated landing
src/app/(protected)/(admin)/<feature>/
  page.tsx                        server component: fetch/check perms, compose sections
  components/                     feature components (.tsx, "use client" if interactive)
  services/                       server actions ("use server")
  utils/                          zod schemas + feature constants/types
src/app/api/<...>/route.ts        route handlers
src/components/ui/                shadcn primitives (button, dialog, drawer, field, ...)
src/components/custom/            shared interactive components (sidebar, combobox, search-params, pagination-params, anim-div, page-header, providers)
src/lib/                          auth (better-auth server+client+config), prisma/client.ts, midtrans/snap.ts
src/utils/constants/              PAGE_SIZE, sidebar menu, report values
src/utils/helpers/                error handling, permissions, formatting
src/utils/hooks/                  useQueryParams, useDebounce, useScreenSize
src/utils/services/               shared server actions
src/utils/types/                  ServerResult, Pagination, API route helpers, enum value arrays
```

## Server actions (the core pattern)
- File starts `"use server"`, colocated in `<feature>/services/` (shared ones in `src/utils/services/`).
- Signature: `export async function x(input): Promise<ServerResult<T>>`, `T` from `@/generated`.
- Canonical body order (see `create-update-product.ts`, `toggle-permission.ts`):
  1. `const session = await authServer()`; `if (!session) throw new Error("Unauthorized")`
  2. `await requirePermissions([...])` — **mandatory** (see Auth & permissions). Page-level checks are UI gating only and never a substitute.
  3. validate: `const parsed = schema.parse(data)` (or `safeParse` + return field errors) — zod schema lives in `<feature>/utils/schema.ts`, `z.input`/`z.infer` form types exported
  4. mutate via `prisma` from `@/lib/prisma/client`; **wrap multi-writes in `prisma.$transaction(async (tx) => ...)`**; prefer `select` over full-entity returns; build typed `select` with `Prisma.validator<Prisma.XSelect>()`
  5. `revalidatePath("/<route>")` after any mutation
  6. `return {success: true, data, message}`
- Wrap everything in `try/catch`; `catch (error) { return handleServerError(error) }`. Never leak raw server errors. No `console.log(error)` full-object dumps — `console.error` a short message if a log is worth keeping.
- Read actions keep the same `ServerResult` envelope and `select` typed payloads; list reads add pagination (see Data fetching).

## ServerResult + error handling
- `src/utils/types/server-action.ts`:
  - `ServerResult<T> = {success:true; data:T; message:string} | {success:false; data:null; message:string; errors?: Record<string,string[]>}`
- `src/utils/helpers/handle-server-errors.ts` → `handleServerError(error)` classifies:
  - Zod → 422 (field errors keyed by `issue.path`)
  - Prisma known (P2002 unique → "Already taken", P2003/P2025 relation) → 400, Prisma validation → 400, connection → 503
  - Midtrans error → its `httpStatusCode`; Axios → `response.status`; other `Error` → 500, except `"Unauthorized"` → 401 and `"Forbidden"` → 403 (used by `requirePermissions`)
- Client side (`src/utils/helpers/handle-client-errors.ts`) unwraps `message` from Axios/Error for toasts.

## API routes
- Route handlers (`src/app/api/<...>/route.ts`) return the same `ServerResult` shape via `src/utils/types/api-routes.ts`:
  - `apiSuccess(data, message, status)` / `apiError(error)` (uses `handleServerError` internally, status → HTTP code).
- Auth: `authServer()` + throw `"Unauthorized"` for user-facing endpoints. **Scope reads/writes to `session.user.id`** (`where: {..., user_id: session.user.id}`) — never trust a client-passed id to imply ownership (see `/api/midtrans/status`).
- Webhooks (Midtrans) skip auth but verify `signature_key` via `sha512` helper **and** cross-check `gross_amount` against the stored order before granting anything.
- Security headers (CSP subset, frame/XCTO/Referrer/Permissions-Policy) are set in `next.config.ts` `headers()` — keep them.

## Client / server boundary
- `"use client"` only on interactive/stateful components (handlers, hooks, form state).
- Pages and all reachable list/grid pieces stay **server components**; they call server actions directly (e.g. `getProducts(page, search)`) and pass data down as props. No client fetch where a server action already returns it.
- Client components import server actions and call them as functions (no API duplication). Server actions that mutate are invoked via `useMutation`, reads via `useQuery` — keyed by stable strings like `["products"]`, `["product", view]`.

## Auth & permissions
- `src/lib/auth.ts` (better-auth config) adds `customSession` that enriches `session.user` with `roles` and `permissions` (via `getSessionExtended`).
- Server: `authServer()` from `@/lib/auth-server`; guards via `hasPermissions(["read x", "manage x"])` / `hasRoles`. **Mutations and reads on admin feature services must call `requirePermissions([...])` (from `@/utils/helpers/has-ability-server`) directly inside the action** — page-level `hasPermissions` redirects are UI gating only. Errors throw `"Forbidden"` (→ 403).
- Client: `authClient` from `@/lib/auth-client`; `hasPermissions`/`hasRoles` client variants read `authClient.useSession()`.
- Permission naming: `"<crud> <attribute>"` (create/read/update/delete/manage), e.g. `"manage products"`. Permission strings check with `.some()` so a user needs any one.
- WHITELISTED_EMAILS signup→admin matching is **normalized** (`trim().toLowerCase()` on both sides) in `src/lib/auth.ts` — never do raw `includes`/`===` against env emails.

## Data fetching, pagination, search, URL state
- List reads: `Promise.all([findMany({skip, take, orderBy, select, where}), count({where})])`; return `{...items, pagination: {page, total, pageCount}}`. `PAGE_SIZE = 10` from `src/utils/constants/pagination.ts`.
- Full-text-ish search: `where: {OR: [{field: {contains: search, mode: "insensitive"}}]}`.
- Page state lives in the URL, not React state:
  - `searchParams` is a **Promise** in Next 16 pages → `const {page, search} = await searchParams`.
  - `useQueryParams()` (src/utils/hooks/useQueryParams.ts) — `getParam(key)`, `setParams(entries, {delay, routerMethod})`; empty string deletes the key.
  - `SearchParams` component → debounced `?search=` (200ms). `PaginationParams` → `?page=` links.
  - Detail/create views keyed by `?view=<create|id>`; drawers/modals render based on `view`, close by clearing it.
- Server component list pattern (see `products/page.tsx`): `<Suspense key={page-search} fallback={Loader2 spinner}><ListComponent/></Suspense>`.

## Forms (client)
- `react-hook-form` + `zodResolver(schema)`; one `FormSchema` type per feature in `<feature>/utils/schema.ts` (export `z.input` for form values, `z.infer` for payload).
- Fields via `<Controller>` with `render={({field, fieldState}) => ...}`; UI primitives `Field / FieldLabel / FieldError / FieldGroup` from `@/components/ui/field`; `aria-invalid={fieldState.invalid}`.
- Selects: `InfiniteCombobox` (static options or infinite query keyed `["<plural>"]`).
- Submit: `useMutation` → server action; `onSuccess`: if `!res.success` toast error, else `toast.success`, `queryClient.invalidateQueries`, close view. `onError`: `toast.error(error.message)`.

## Prisma rules
- Client: `@/lib/prisma/client` (singleton with `PrismaPg` adapter). Import models/types/enums/Prisma namespace from `@/generated/index`; client entry is `@/generated/client`.
- Schema (`prisma/schema.prisma`): snake_case fields (`price_actual`, `created_at`), `@@map` to snake_case table names, `@default(uuid())` ids, join tables use composite `@@id`, money is `Int`, audit timestamps `created_at @default(now())` / `updated_at @updatedAt`.
- After schema edits: `npx prisma generate` (client is committed; run builds re-generate).
- Write `createMany`/`create` in a `$transaction` when idempotency + multi-table consistency matters (see midtrans webhook → entitlements).

## UI & styling
- Tailwind v4 utility classes + semantic tokens (`bg-background`, `text-muted-foreground`, `border-border`, `text-primary`) — never hardcode colors. Root font-size is 12px.
- `cn()` from `@/lib/utils` for conditional classes; `cva` for variants.
- Reuse `src/components/custom/` (AnimDiv for entry animation, PageHeader, Empty component for error/no-data states) before writing bespoke markup.
- Dark mode via `next-themes`; `toast` from `sonner`.

## Environment variables
`DATABASE_URL`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `WHITELISTED_EMAILS`, `MIDTRANS_SERVER_KEY`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`, `NEXT_PUBLIC_MIDTRANS_URL`.

## Commands
- Dev `npm run dev` · Build `npm run build` · Start `npm run start` · Lint `npm run lint` (eslint).
- Prisma: `npx prisma migrate dev`, `npx prisma generate`, `npx prisma studio`.

## Git
- Commit style: conventional prefixes (`feat:`, `fix:`), lowercase, imperative, one-liners (see `git log`).

## Do not
- Do not import Prisma from `@prisma/client` — use `@/generated/*`.
- Do not add client-side auth/validation logic — server actions own it.
- Do not duplicate a server action's fetch in a client component — pass data down or call the action.
- Do not introduce new UI libraries — shadcn primitives + `components.json` stack covers it.
- Do not skip `revalidatePath` after mutations.
- Do not gate admin features by page `hasPermissions` only — every admin server action must enforce `requirePermissions([...])`.
- Do not read or write another user's scoped records by client-passed id without adding `user_id: session.user.id` to the `where`.
<!-- END:repo-conventions -->