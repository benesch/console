import "webpack-dev-server";

import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import builder from "content-security-policy-builder";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import fs from "fs";
import path from "path";
import { DefinePlugin } from "webpack";
import { merge } from "webpack-merge";

import getCspPolicy from "./csp";
import base, { IDefinePluginOptions } from "./webpack.config";

function loadFronteggUrl(): string {
  if (process.env.FRONTEGG_URL) {
    return JSON.stringify(process.env.FRONTEGG_URL);
  }
  const buffer = fs.readFileSync("../config/settings/local.outputs.json");
  const outputData = JSON.parse(buffer.toString());
  return JSON.stringify(outputData["frontegg_url"]);
}

const appHostname = process.env.APP_HOSTNAME || "staging.cloud.materialize.com";
const provisionHostname =
  process.env.PROVISION_HOSTNAME || "staging.materialize.cloud";
const DefinePluginOptions: IDefinePluginOptions = {
  __FRONTEGG_URL__: DefinePlugin.runtimeValue(loadFronteggUrl, [
    path.resolve("../config/settings/local.outputs.json"),
  ]),
  __SEGMENT_API_KEY__: JSON.stringify("dGeQYRjmGVsqDI0KIARrAhTvk1BdJJhk"),
  __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN || null),
  __SENTRY_ENVIRONMENT__: JSON.stringify(
    process.env.SENTRY_ENVIRONMENT || null
  ),
  __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE || null),
  __STATUSPAGE_ID__: JSON.stringify("qf52z1jnw4q8"),
  __GOOGLE_ANALYTICS_ID__: JSON.stringify(null),
  __RELEASE_NOTES_ROOT_URL__: JSON.stringify("https://materialize.com/blog"),
  __LAST_RELEASE_NOTE_ID__: JSON.stringify(null),
  __IS_DEVELOPMENT__: JSON.stringify(true),
  __ENVIRONMENTD_SCHEME__: JSON.stringify(
    process.env.ENVIRONMENTD_SCHEME || "auto"
  ),
};

const backendHostname = process.env.BACKEND_HOST || "[::1]:8000";
const backendHostUrl = backendHostname.startsWith("http")
  ? backendHostname
  : `http://${backendHostname}`;

const reportUrl = new URL(
  "https://o561021.ingest.sentry.io/api/5699757/security/?sentry_key=13c8b3a8d1e547c9b9493de997b04337"
);
reportUrl.searchParams.append(
  "sentry_environment",
  DefinePluginOptions.__SENTRY_ENVIRONMENT__
);
reportUrl.searchParams.append(
  "sentry_release",
  DefinePluginOptions.__SENTRY_RELEASE__
);

const cspPolicy = getCspPolicy({
  fronteggUrl: JSON.parse(loadFronteggUrl()) as string,
  statusPageId: JSON.parse(DefinePluginOptions.__STATUSPAGE_ID__) as string,
  appHostname: "localhost:3000",
});

if (
  ["true", "yes", "1"].includes(
    (process.env.FIREFOX_DEV ?? "false").toLowerCase()
  )
) {
  // Allow React devtools to work in Firefox
  //  See: https://github.com/facebook/react/issues/17997
  //       https://bugzilla.mozilla.org/show_bug.cgi?id=1267027
  cspPolicy["script-src"].push("'unsafe-inline'");
}

cspPolicy["connect-src"].push(
  "http://localhost:8001",
  "http://localhost:8002",
  "http://invalid:8002",
  // kind IPs on macOS and Linux, for access to `materialized` running in
  //  an environment.
  "http://127.0.0.1:*",
  `https://ec.0.us-east-1.aws.${appHostname}`,
  `https://ec.0.eu-west-1.aws.${appHostname}`,
  `https://rc.us-east-1.aws.${appHostname}`,
  `https://rc.eu-west-1.aws.${appHostname}`,
  `http://*.us-east-1.aws.${provisionHostname}:443`,
  `http://*.eu-west-1.aws.${provisionHostname}:443`
);

const CSP = builder({
  directives: cspPolicy,
});

module.exports = merge(base, {
  mode: "development",
  devServer: {
    host: "0.0.0.0",
    port: 3000,
    hot: true,
    allowedHosts: ["frontend", "localhost"],
    historyApiFallback: true,
    proxy: {
      "/api": {
        changeOrigin: true,
        target: backendHostUrl,
      },
      "/admin": backendHostUrl,
      "/static": backendHostUrl,
    },
    headers: {
      "Reporting-Endpoints": `sentry="${reportUrl.toString()}"`,
      "Content-Security-Policy": CSP,
    },
  },
  devtool: "inline-cheap-module-source-map",
  // https://github.com/webpack/webpack-dev-server/issues/2758#issuecomment-751445974
  target: "web",
  plugins: [
    new DefinePlugin(DefinePluginOptions),
    new ForkTsCheckerWebpackPlugin(),
    new ReactRefreshWebpackPlugin({
      overlay: { sockPort: 3000 },
    }),
  ],
  output: {
    publicPath: "auto",
  },
});
