import "webpack-dev-server";

import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { DefinePlugin } from "webpack";
import { merge } from "webpack-merge";

import localOutputs from "../config/settings/local.outputs.json";
import base, { IDefinePluginOptions, statuspageId } from "./webpack.config";

const fronteggUrl = process.env.FRONTEGG_URL || localOutputs.frontegg_url;

const backendUrl = process.env.BACKEND_URL || "http://[::1]:8000";

const definePluginOptions: IDefinePluginOptions = {
  __FRONTEGG_URL__: JSON.stringify(fronteggUrl),
  __SEGMENT_API_KEY__: JSON.stringify("dGeQYRjmGVsqDI0KIARrAhTvk1BdJJhk"),
  __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN || null),
  __SENTRY_ENVIRONMENT__: JSON.stringify(
    process.env.SENTRY_ENVIRONMENT || null
  ),
  __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE || null),
  __STATUSPAGE_ID__: JSON.stringify(statuspageId),
  __GOOGLE_ANALYTICS_ID__: JSON.stringify(null),
  __ENVIRONMENTD_SCHEME__: JSON.stringify(
    process.env.ENVIRONMENTD_SCHEME || "http"
  ),
};

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
        target: backendUrl,
      },
      "/admin": backendUrl,
      "/static": backendUrl,
    },
  },
  devtool: "inline-cheap-module-source-map",
  // https://github.com/webpack/webpack-dev-server/issues/2758#issuecomment-751445974
  target: "web",
  plugins: [
    new DefinePlugin(definePluginOptions),
    new ForkTsCheckerWebpackPlugin(),
    new ReactRefreshWebpackPlugin({
      overlay: { sockPort: 3000 },
    }),
  ],
  output: {
    publicPath: "/",
  },
});
