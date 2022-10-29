import "webpack-dev-server";

import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import fs from "fs";
import path from "path";
import { DefinePlugin } from "webpack";
import { merge } from "webpack-merge";

import base, { IDefinePluginOptions } from "./webpack.config";

function loadFronteggUrl(): string {
  if (process.env.FRONTEGG_URL) {
    return JSON.stringify(process.env.FRONTEGG_URL);
  }
  const buffer = fs.readFileSync("../config/settings/local.outputs.json");
  const outputData = JSON.parse(buffer.toString());
  return JSON.stringify(outputData["frontegg_url"]);
}

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
  __ENVIRONMENTD_SCHEME__: JSON.stringify(
    process.env.ENVIRONMENTD_SCHEME || "http"
  ),
};

const backendHostname = process.env.BACKEND_HOST || "[::1]:8000";
const backendHostUrl = backendHostname.startsWith("http")
  ? backendHostname
  : `http://${backendHostname}`;

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
    publicPath: "/",
  },
});
