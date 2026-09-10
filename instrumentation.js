import * as Sentry from "@sentry/nextjs";

// Instrumentation runs once when the server starts, loading the
// correct runtime config (server or edge).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Capture route-transition errors on the server for Next.js page transitions.
export const onRequestError = Sentry.captureRequestError;
