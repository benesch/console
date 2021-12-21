/** global type definitions and interface merging */

/**
 * Required configuration properties for the frontend.
 *
 * These are set by the backend on `window.CONFIG`.
 */
export interface GlobalConfig {
  fronteggUrl: string;
  segmentApiKey: string | null;
  sentryDsn: string | null;
  sentryEnvironment: string | null;
  sentryRelease: string | null;
  googleAnalyticsId: string | null;
  releaseNotesRootURL: string | null;
  lastReleaseNoteId: string | null;
}

declare global {
  interface Window {
    CONFIG: GlobalConfig;
  }
}
