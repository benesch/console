/* Globals injected by Webpack's DefinePlugin.*/

const config = {
  fronteggUrl: __FRONTEGG_URL__,
  segmentApiKey: __SEGMENT_API_KEY__,
  sentryDsn: __SENTRY_DSN__,
  sentryEnvironment: __SENTRY_ENVIRONMENT__,
  sentryRelease: __SENTRY_RELEASE__,
  statuspageId: __STATUSPAGE_ID__,
  googleAnalyticsId: __GOOGLE_ANALYTICS_ID__,
  releaseNotesRootURL: __RELEASE_NOTES_ROOT_URL__,
  lastReleaseNoteId: __LAST_RELEASE_NOTE_ID__,
  isDevelopment: __IS_DEVELOPMENT__,
};

export type GlobalConfig = typeof config;

export default config;
