# Sentry error monitoring

Setup follows the official sentry.dev instrument skill (Next.js manual path).

## Files
- `instrumentation-client.js` — browser SDK: errors, tracing, session replay,
  tunnel route, navigation hook (`onRouterTransitionStart`)
- `sentry.server.config.js` — Node server: errors, tracing, local variables, logs
- `sentry.edge.config.js` — edge runtime
- `instrumentation.js` — boots server/edge configs, `onRequestError` hook
- `app/global-error.jsx` — client error boundary reporting to Sentry
- `next.config.mjs` — `withSentryConfig` wrapper (release injection + sourcemap
  upload on build; disabled when `SENTRY_AUTH_TOKEN` is absent)

## Env vars (set in .env.local locally + Vercel for prod)
Only one DSN is actually needed — both client and server fall back to the public one.
```
NEXT_PUBLIC_SENTRY_DSN=https://<full DSN from sentry.io settings>
SENTRY_ORG=<org-slug>
SENTRY_PROJECT=<project-slug>
SENTRY_AUTH_TOKEN=***  # optional until prod builds need sourcemap upload
```
(Optionally set `SENTRY_DSN` separately for server/edge; it defaults to the public DSN.)

Without a DSN the SDK stays disabled — no noise locally, no code changes needed.

## How to use
- Automatic: client errors, server route errors, render crashes → sentry.io Issues.
- Manual: `import * as Sentry from "@sentry/nextjs"` → `Sentry.captureException(err)`,
  `Sentry.captureMessage("...")`, `Sentry.setUser(...)`, `Sentry.setTag(...)`,
  `Sentry.logger.info("...")` (logs enabled).
- Replay: 10% of sessions, 100% of sessions with errors.
- Browser events POST to `/monitoring` (tunnel route) so ad-blockers don't drop them.
- Prod stack traces readable via automatic sourcemap upload on `next build`.

## Verify a test error
Throw in any component/route, run the app, check https://sentry.io/issues/ within ~30s.
