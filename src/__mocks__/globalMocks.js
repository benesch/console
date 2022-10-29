require("isomorphic-fetch");

// eslint-disable-next-line no-undef
window.crypto = {};
// eslint-disable-next-line no-undef
window.crypto.getRandomValues = () => new Uint32Array(1);

/* eslint-disable no-undef */
window.__FRONTEGG_URL__ = "http://frontegg.com";
window.__SEGMENT_API_KEY__ = "segment-api-key";
window.__SENTRY_DSN__ = "https://sentry.io/sentry-key";
window.__SENTRY_ENVIRONMENT__ = "sentry-environment";
window.__SENTRY_RELEASE__ = "sentry-release";
window.__STATUSPAGE_ID__ = "statuspage-dummy-id";
window.__GOOGLE_ANALYTICS_ID__ = "google-analytics-id";
window.__RELEASE_NOTES_ROOT_URL__ = null;
window.__LAST_RELEASE_NOTE_ID__ = null;
window.__IS_DEVELOPMENT__ = false;
window.__ENVIRONMENTD_SCHEME__ = "http";
window.__CLOUD_REGIONS__ = [];
/* eslint-enable */
