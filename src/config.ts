/* Globals injected by Webpack's DefinePlugin.*/

const config = {
  environmentdScheme: __ENVIRONMENTD_SCHEME__,
  fronteggUrl: __FRONTEGG_URL__,
  segmentApiKey: __SEGMENT_API_KEY__,
  sentryDsn: __SENTRY_DSN__,
  sentryEnvironment: __SENTRY_ENVIRONMENT__,
  sentryRelease: __SENTRY_RELEASE__,
  statuspageId: __STATUSPAGE_ID__,
  googleAnalyticsId: __GOOGLE_ANALYTICS_ID__,
};

export type GlobalConfig = typeof config;

export default config;
