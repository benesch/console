const baseConfig = {
  "base-uri": ["'self'"],
  "child-src": ["'none'"],
  "connect-src": [
    "'self'",
    "https://o561021.ingest.sentry.io",
    "https://cdn.segment.com/",
    "https://assets.frontegg.com/",
    "https://www.google-analytics.com",
    "https://api.segment.io/",
  ],
  "default-src": ["'self'"],
  "form-action": ["'self'"],
  "font-src": [
    "'self'",
    "data:",
    "fonts.gstatic.com/",
    "fonts.googleapis.com/",
  ],
  "frame-ancestors": ["'none'"],
  "frame-src": [
    "https://js.stripe.com",
    "https://calendly.com",
    "https://www.recaptcha.net/recaptcha/",
  ],
  "img-src": [
    "'self'",
    "data:",
    "https://cdn.jsdelivr.net/npm/swagger-ui-dist@latest/favicon-32x32.png",
    "https://www.gravatar.com",
    "https://i0.wp.com",
    "https://fronteggprodeustorage.blob.core.windows.net",
    "https://avatars.githubusercontent.com",
    "https://lh3.googleusercontent.com",
    "https://www.google-analytics.com",
    "http://unpkg.com",
  ],
  "object-src": ["'none'"],
  "script-src": [
    "'self'",
    "https://js.stripe.com",
    "https://www.recaptcha.net/recaptcha/",
    "https://www.google-analytics.com",
    "https://assets.frontegg.com",
  ],
  "script-src-elem": [] as string[],
  "style-src": [
    "'self'",
    "'unsafe-inline'",
    "fonts.googleapis.com/css2",
    "https://assets.frontegg.com/",
    "https://cdn.jsdelivr.net/npm/swagger-ui-dist@latest/swagger-ui.css",
    "http://unpkg.com",
  ],
  "worker-src": ["'none'"],
  "report-to": "sentry",
};

export default function getCspPolicy(options: {
  fronteggUrl: string;
  statusPageId: string;
  appHostname: string;
}): typeof baseConfig {
  const config: typeof baseConfig = JSON.parse(JSON.stringify(baseConfig));
  config["form-action"].push(options.appHostname); // allow Django-admin forms to work
  config["frame-src"].push(`https://${options.statusPageId}.statuspage.io`);
  config["script-src-elem"].push(
    ...config["script-src"],
    `${options.appHostname}/static/admin/js/nav_sidebar.js`
  );
  config["connect-src"].push(options.fronteggUrl);
  return config;
}
