// This file configures the initialization of Sentry on the client.
// The optional config you define here overrides the defaults on the browser SDK.
// For more, see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 for 100% trace capture while debugging; lower in prod.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  // Capture Replay for 10% of sessions and 100% of sessions with an error.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Don't spam noise from browser extensions or ad blockers.
  ignoreErrors: [
    /ResizeObserver loop/,
    /Non-Error promise rejection captured/,
  ],

  // Strip noisy personal data.
  sendDefaultPii: false,

  integrations: [Sentry.replayIntegration()],
  tunnelRoute: "/monitoring",
});

// Required for client-side navigation instrumentation (App Router transitions).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
