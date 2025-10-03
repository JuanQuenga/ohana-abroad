## Migration Plan: Vite + Convex Auth → Next.js App Router + WorkOS AuthKit

### Goals

- Replace Convex Auth (password provider) and SPA/Vite shell with Next.js App Router and WorkOS AuthKit for auth/session management.
- Keep Convex backend and data model; authenticate Convex requests with WorkOS access tokens.
- Preserve existing trip features; remove bespoke sign-in form.

### Non-goals

- Rewriting Convex domain logic or schema.
- Migrating existing user documents beyond a simple identity linking strategy.

---

### High-level Architecture

- Next.js 15 App Router app provides UI, routing, and auth.
- AuthKit manages sessions via secure cookies and provides access tokens.
- Middleware protects routes and handles redirects to AuthKit.
- Convex backend remains as-is; client calls include WorkOS access tokens via a `getAuth` callback.
- Convex server validates identity using standard JWT/OIDC configuration (accept tokens issued by WorkOS).

References: `@workos-inc/authkit-nextjs` for App Router use, middleware, `withAuth`/`useAuth`, and `signOut` [workos/authkit-nextjs](https://github.com/workos/authkit-nextjs).

---

### Dependencies

- Add (frontend):
  - `next@latest`, `react@latest`, `react-dom@latest`
  - `@workos-inc/authkit-nextjs@latest`
  - `tailwindcss@latest`, `postcss@latest`, `autoprefixer@latest`
  - `@types/node@latest` (TS)
- Keep (backend):
  - `convex` (server + react client)
- Remove:
  - `@convex-dev/auth` packages and related usage (client provider, server routes)

---

### Environment Variables

Add to `.env.local` (and production environment):

```
WORKOS_CLIENT_ID="client_..."            # From WorkOS dashboard
WORKOS_API_KEY="sk_..."                  # From WorkOS dashboard
WORKOS_COOKIE_PASSWORD="<32+ char secret>"  # For session cookie encryption
NEXT_PUBLIC_WORKOS_REDIRECT_URI="http://localhost:3000/callback"  # Must match WorkOS config

# Convex
NEXT_PUBLIC_CONVEX_URL="https://<your-convex-deployment>.convex.cloud"
```

Notes:

- Use unique production values and secrets per environment.
- Consider setting a non-default Logout URI for `signOut({ returnTo })`.

---

### Project Structure Changes

- Replace Vite entry with Next.js App Router structure:
  - `app/layout.tsx`: global layout; wraps providers.
  - `app/page.tsx`: home/dashboard page.
  - `middleware.ts`: `authkitMiddleware` to protect routes and manage redirects.
  - `app/providers.tsx`: centralizes `AuthKitProvider` and Convex client provider.
  - Migrate `src/components/**` into appropriate `app/(components)` or `components/` and import into pages.
- Keep `convex/` folder unchanged initially.

---

### AuthKit Integration (Next.js)

1. Middleware for auth and redirects (with SSRF mitigation and cookie forwarding):

```ts
// middleware.ts
import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  debug: process.env.NODE_ENV !== "production",
  // Paths that should trigger a sign-up hint
  signUpPaths: ["/sign-up", "/dashboard/:path*"],
});

export const config = {
  matcher: ["/", "/dashboard/:path*", "/account/:path*"],
};
```

2. Root layout with provider:

```tsx
// app/layout.tsx
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthKitProvider>{children}</AuthKitProvider>
      </body>
    </html>
  );
}
```

3. Gating and token access:

- Server components: `const { user, accessToken } = await withAuth({ ensureSignedIn: true });`
- Client components: `const { user, getAccessToken } = useAuth();`

4. Sign-out button:

```tsx
import { signOut } from "@workos-inc/authkit-nextjs";

export function SignOutButton() {
  return <button onClick={() => signOut({ returnTo: "/" })}>Sign out</button>;
}
```

Security note: When composing custom middleware, forward incoming request headers and preserve AuthKit headers on responses/redirects to mitigate SSRF and preserve cookies, per AuthKit guidance [workos/authkit-nextjs](https://github.com/workos/authkit-nextjs).

---

### Convex Client Integration (Next.js)

Goal: Ensure all Convex requests include a valid WorkOS access token.

Approach:

- Create a client-side Convex provider that uses AuthKit to obtain tokens and passes them via `getAuth` to `ConvexReactClient`.

```tsx
// app/providers.tsx
"use client";
import { ReactNode, useMemo } from "react";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { useAuth } from "@workos-inc/authkit-nextjs";

export function AppProviders({ children }: { children: ReactNode }) {
  const { getAccessToken } = useAuth();

  const convex = useMemo(
    () =>
      new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string, {
        getAuth: async () => {
          try {
            const token = await getAccessToken();
            return token ?? null;
          } catch {
            return null;
          }
        },
      }),
    [getAccessToken]
  );

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

Then wrap `children` in `AppProviders` inside `layout.tsx` (inside `AuthKitProvider`).

---

### Convex Server Authentication Changes

- Remove `@convex-dev/auth` usage:
  - Delete `convex/auth.ts` exports of `{ auth, signIn, signOut, store, isAuthenticated }` and any `auth.addHttpRoutes(http)` wiring.
  - Remove `Password` provider use.
- Update Convex auth configuration to validate WorkOS JWTs via OIDC/JWKS in `convex/auth.config.ts` (per Convex external JWT docs):
  - Configure issuer/audience (WorkOS) and JWKS URI so Convex can verify tokens.
  - After configuration, prefer `ctx.auth.getUserIdentity()` on the server to access identity claims (e.g., `subject`, `email`).
- Replace uses of `getAuthUserId(ctx)` with:

```ts
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");
const subject = identity.subject; // Stable user id from WorkOS token
```

- Keep user documents keyed or indexed by `subject` (or map `subject` to an internal user `_id`). On first login, create a user record if missing.

---

### UI Updates

- Remove `Authenticated`/`Unauthenticated` wrappers from `convex/react`.
- Server pages/components: use `withAuth({ ensureSignedIn: true })` to fetch user and render protected screens.
- Client components: use `useAuth()` to conditionally render and to obtain tokens only when needed.
- Remove bespoke `SignInForm` and replace with middleware-driven redirect to AuthKit; optionally provide explicit "Sign in" link to AuthKit start path if you want a manual entry point.

---

### Data & Migration Considerations

- Existing data likely references Convex Auth user ids. Introduce a mapping from WorkOS `subject` to your `users` documents, or migrate documents to reference `subject` directly.
- On first login with WorkOS, upsert a user document keyed by `subject` and persist relevant profile fields (email, name).
- Audit queries/mutations across `convex/*` files and replace `getAuthUserId` checks with `ctx.auth.getUserIdentity()` checks.

---

### Security & Best Practices

- Implement a CSP on authenticated pages if handling sensitive data.
- Minimize third-party scripts on authenticated routes.
- Follow AuthKit middleware guidance to forward headers and preserve `set-cookie` on redirects [workos/authkit-nextjs](https://github.com/workos/authkit-nextjs).

---

### Dev & Build Steps

1. Install deps:

```
pnpm add next react react-dom @workos-inc/authkit-nextjs
pnpm add -D tailwindcss postcss autoprefixer @types/node
```

2. Scaffold Next.js App Router structure (`app/`, `middleware.ts`, `next.config.js`).
3. Move UI from `src/` to `app/` pages/components; keep styling with Tailwind (re-use `tailwind.config.js`).
4. Add providers in `layout.tsx` and `app/providers.tsx`.
5. Wire Convex client with `getAuth` from AuthKit (client side).
6. Configure Convex server auth to trust WorkOS tokens; update server functions to use `ctx.auth.getUserIdentity()`.
7. Remove `@convex-dev/auth` code and routes.
8. Update scripts:

```
"dev": "next dev",
"build": "next build",
"start": "next start"
```

9. Run locally, verify sign-in, protected routes, and Convex queries/mutations.

---

### Rollout Plan

- Branch: `feat/authkit-migration`.
- Ship behind an environment flag (deploy Next.js app to a preview URL) while Convex backend is shared.
- Verify: login, logout, route protection, token refresh, Convex queries across all tabs.
- Data: verify user provisioning on first login; backfill mapping if necessary.
- Cutover: switch DNS/app entry to Next.js; decommission Vite entry.
- Rollback: keep Vite build scripts for one sprint in case of regressions.

---

### Open Questions / Decisions

- Confirm final protected route patterns for middleware matcher.
- Decide on user id strategy: store WorkOS `subject` directly vs. internal user id with a mapping.
- Decide if we must support invitation links pre-auth; middleware can preserve query params and handle post-login flows.

---

### Appendix: Useful AuthKit APIs

- `authkitMiddleware({ signUpPaths })`
- `withAuth({ ensureSignedIn })` for server components/actions.
- `useAuth()` for client hooks: `user`, `getAccessToken()`.
- `signOut({ returnTo })`.

Source: WorkOS AuthKit for Next.js [workos/authkit-nextjs](https://github.com/workos/authkit-nextjs)
