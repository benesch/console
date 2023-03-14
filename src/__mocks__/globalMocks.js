require("isomorphic-fetch");

// eslint-disable-next-line no-undef
window.crypto = {};
// eslint-disable-next-line no-undef
window.crypto.getRandomValues = () => new Uint32Array(1);

/* eslint-disable no-undef */
window.__DEFAULT_STACK__ = "test";
window.__FORCE_OVERRIDE_STACK__ = undefined;
window.__LAUNCH_DARKLY_KEY__ = "launchdarkly-dummy-key";
window.__RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED__ = false;
window.__SEGMENT_API_KEY__ = "segment-api-key";
window.__SENTRY_DSN__ = null;
window.__SENTRY_ENVIRONMENT__ = "sentry-environment";
window.__SENTRY_RELEASE__ = "sentry-release";
window.__STATUSPAGE_ID__ = "statuspage-dummy-id";
/* eslint-enable */
