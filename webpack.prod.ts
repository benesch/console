import CspWebpackPlugin from "@melloware/csp-webpack-plugin";
import { DefinePlugin } from "webpack";
import { merge } from "webpack-merge";

import getCspPolicy from "./csp";
import { assert } from "./src/util";
import base, { IDefinePluginOptions } from "./webpack.config";

const sentryEnvironment = process.env.SENTRY_ENVIRONMENT;
const sentryDsn = ["production", "staging"].includes(sentryEnvironment || "")
  ? "https://13c8b3a8d1e547c9b9493de997b04337@o561021.ingest.sentry.io/5699757"
  : null;

const DefinePluginOptions: IDefinePluginOptions = {
  __FRONTEGG_URL__: JSON.stringify(process.env.FRONTEGG_URL),
  __SEGMENT_API_KEY__: JSON.stringify(process.env.FRONTEND_SEGMENT_API_KEY),
  __SENTRY_DSN__: JSON.stringify(sentryDsn),
  __SENTRY_ENVIRONMENT__: JSON.stringify(sentryEnvironment),
  __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE || null),
  __STATUSPAGE_ID__: JSON.stringify("qf52z1jnw4q8"),
  __GOOGLE_ANALYTICS_ID__: JSON.stringify("UA-138552650-1"),
  __RELEASE_NOTES_ROOT_URL__: JSON.stringify("https://materialize.com/blog"),
  __LAST_RELEASE_NOTE_ID__: JSON.stringify(null),
  __IS_DEVELOPMENT__: JSON.stringify(false),
  __ENVIRONMENTD_SCHEME__: JSON.stringify("auto"),
};

const appHostname = process.env.APP_HOSTNAME;
if (!appHostname) {
  throw new Error("`APP_HOSTNAME` must be defined");
}
const provisionHostname = process.env.PROVISION_HOSTNAME;
if (!provisionHostname) {
  throw new Error("`PROVISION_HOSTNAME` must be defined");
}
if (!DefinePluginOptions.__FRONTEGG_URL__) {
  throw new Error("`FRONTEGG_URL` must be defined");
}
assert(typeof DefinePluginOptions.__FRONTEGG_URL__ === "string");

if (!process.env.GIT_SHA) {
  throw new Error("`GIT_SHA` must be defined");
}
const assetPath = `/assets/${process.env.GIT_SHA}/`;

const cspPolicy = getCspPolicy({
  fronteggUrl: JSON.parse(DefinePluginOptions.__FRONTEGG_URL__) as string,
  statusPageId: JSON.parse(DefinePluginOptions.__STATUSPAGE_ID__) as string,
  appHostname,
});

cspPolicy["connect-src"].push(
  `https://ec.0.us-east-1.aws.${appHostname}`,
  `https://ec.0.eu-west-1.aws.${appHostname}`,
  `https://rc.us-east-1.aws.${appHostname}`,
  `https://rc.eu-west-1.aws.${appHostname}`,
  `https://*.us-east-1.aws.${provisionHostname}`,
  `https://*.eu-west-1.aws.${provisionHostname}`
);

module.exports = merge(base, {
  mode: "production",
  plugins: [
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
  ],
  output: {
    crossOriginLoading: "anonymous",
    publicPath: assetPath,
  },
});
