import CspWebpackPlugin from "@melloware/csp-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import fs from "fs";
import path from "path";
import { DefinePlugin } from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { merge } from "webpack-merge";

import base, { IDefinePluginOptions, statuspageId } from "./webpack.config";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable must be defined`);
  }
  return value;
}

const launchDarklyKey = requireEnv("LAUNCH_DARKLY_KEY");

const sentryEnvironment = process.env.SENTRY_ENVIRONMENT;
const sentryDsn = ["production", "staging"].includes(sentryEnvironment || "")
  ? "https://13c8b3a8d1e547c9b9493de997b04337@o561021.ingest.sentry.io/5699757"
  : null;
const sentryRelease = requireEnv("SENTRY_RELEASE");

const gitSha = requireEnv("GIT_SHA");
const publicPath = `/assets/${gitSha}/`;

const DefinePluginOptions: IDefinePluginOptions = {
  __DEFAULT_STACK__: JSON.stringify(process.env.DEFAULT_STACK || "production"),
  __LAUNCH_DARKLY_KEY__: JSON.stringify(launchDarklyKey),
  __RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED__: JSON.stringify(false),
  __SEGMENT_API_KEY__: JSON.stringify(
    process.env.FRONTEND_SEGMENT_API_KEY || null
  ),
  __SENTRY_DSN__: JSON.stringify(sentryDsn),
  __SENTRY_ENVIRONMENT__: JSON.stringify(sentryEnvironment),
  __SENTRY_RELEASE__: JSON.stringify(sentryRelease),
  __STATUSPAGE_ID__: JSON.stringify(statuspageId),
};

const metadataDir = `${__dirname}/public/_metadata`;
try {
  fs.accessSync(metadataDir, fs.constants.F_OK);
} catch (err) {
  fs.mkdirSync(metadataDir);
}
fs.writeFileSync(
  `${metadataDir}/cloud-regions.json`,
  requireEnv("CLOUD_REGIONS")
);

const scriptSrc = [
  "'self'",
  "https://js.stripe.com",
  "https://www.recaptcha.net/recaptcha/",
  "https://*.googletagmanager.com",
  "https://assets.frontegg.com",
  "https://cdn.segment.com",
];

const cspPolicy = {
  "base-uri": ["'self'"],
  "child-src": ["'none'"],
  "connect-src": [
    "'self'",
    "https://o561021.ingest.sentry.io",
    "https://api.segment.io",
    "https://api.segment.materialize.com",
    "https://cdn.segment.com",
    "https://assets.frontegg.com/",
    "https://*.g.doubleclick.net",
    "https://*.googletagmanager.com",
    "https://*.google.com",
    "https://*.launchdarkly.com",
    "https://*.cloud.materialize.com",
    "https://*.materialize.cloud",
  ],
  "default-src": ["'self'"],
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
    `https://${statuspageId}.statuspage.io`,
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
    "https://*.googletagmanager.com",
    "https://*.g.doubleclick.net",
    "https://*.google.com",
    "http://unpkg.com",
  ],
  "object-src": ["'none'"],
  "script-src": scriptSrc,
  "script-src-elem": scriptSrc,
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

const plugins = [
  new DefinePlugin(DefinePluginOptions),
  new CspWebpackPlugin(
    {
      ...cspPolicy,
      "upgrade-insecure-requests": "",
    },
    {
      nonceEnabled: {
        "script-src": false,
        "style-src": false,
      },
      primeReactEnabled: false,
    }
  ),
  new CopyPlugin({
    patterns: [
      {
        from: "public/_metadata",
        to: "_metadata",
      },
    ],
  }),
];

if (process.env.SOURCE_MAPS) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SentryPlugin = require("@sentry/webpack-plugin");
  plugins.push(
    new SentryPlugin({
      include: path.resolve(__dirname, "dist", "frontend"),
      org: "materializeinc",
      project: "cloud-frontend",
      release: process.env.SENTRY_RELEASE,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      urlPrefix: `~${publicPath}`,
      __SENTRY_DEBUG__: false,
    })
  );
}

if (process.env.BUNDLE_ANALYZE) {
  plugins.push(new BundleAnalyzerPlugin());
}

module.exports = merge(base, {
  mode: "production",
  plugins,
  output: {
    crossOriginLoading: "anonymous",
    publicPath,
  },
});
