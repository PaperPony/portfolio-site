"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

// Next.js error boundary for client-side rendering errors.
// Reports to Sentry, then renders Next's default error page.
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
