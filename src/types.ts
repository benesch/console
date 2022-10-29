/** global type definitions and interface merging */

/**
 * Required configuration properties for the frontend.
 */
export {};

declare global {
  const __FRONTEGG_URL__: string;
  const __SEGMENT_API_KEY__: string | null;
  const __SENTRY_DSN__: string | null;
  const __SENTRY_ENVIRONMENT__: string | null;
  const __SENTRY_RELEASE__: string | null;
  const __GOOGLE_ANALYTICS_ID__: string | null;
  const __STATUSPAGE_ID__: string;
  const __ENVIRONMENTD_SCHEME__: "http" | "https";
}
