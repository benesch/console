import "webpack-dev-server";

import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import { DefinePlugin } from "webpack";
import { merge } from "webpack-merge";

import base, { IDefinePluginOptions, statuspageId } from "./webpack.config";

const definePluginOptions: IDefinePluginOptions = {
  __DEFAULT_STACK__: JSON.stringify(process.env.DEFAULT_STACK || "staging"),
  __FORCE_OVERRIDE_STACK__: JSON.stringify(process.env.FORCE_OVERRIDE_STACK),
  __RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED__: JSON.stringify(true),
  __SEGMENT_API_KEY__: JSON.stringify("dGeQYRjmGVsqDI0KIARrAhTvk1BdJJhk"),
  __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN || null),
  __SENTRY_ENVIRONMENT__: JSON.stringify(
    process.env.SENTRY_ENVIRONMENT || null
  ),
  __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE || null),
  __STATUSPAGE_ID__: JSON.stringify(statuspageId),
};

module.exports = merge(base, {
  mode: "development",
  devServer: {
    host: "0.0.0.0",
    port: 3000,
    hot: true,
    allowedHosts: ["localhost", "127.0.0.1"],
    historyApiFallback: true,
  },
  devtool: "inline-cheap-module-source-map",
  // https://github.com/webpack/webpack-dev-server/issues/2758#issuecomment-751445974
  target: "web",
  plugins: [
    new DefinePlugin(definePluginOptions),
    new ReactRefreshWebpackPlugin({
      overlay: { sockPort: 3000 },
    }),
  ],
  output: {
    publicPath: "/",
  },
});
