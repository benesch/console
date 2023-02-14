import "webpack-dev-server";

import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import { DefinePlugin } from "webpack";
import { merge } from "webpack-merge";

import { buildCloudRegions } from "./src/cloudRegions";
import base, { IDefinePluginOptions, statuspageId } from "./webpack.config";

const definePluginOptions: IDefinePluginOptions = {
  __DEFAULT_STACK__: JSON.stringify(process.env.DEFAULT_STACK || "staging"),
  __LAUNCH_DARKLY_KEY__: JSON.stringify("6388e8b9750ee71144183456"),
  __RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED__: JSON.stringify(true),
  __SEGMENT_API_KEY__: JSON.stringify("dGeQYRjmGVsqDI0KIARrAhTvk1BdJJhk"),
  __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN || null),
  __SENTRY_ENVIRONMENT__: JSON.stringify(
    process.env.SENTRY_ENVIRONMENT || null
  ),
  __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE || null),
  __STATUSPAGE_ID__: JSON.stringify(statuspageId),
};

const cloudRegions = buildCloudRegions(process.env.PROXY_STACK || "local");

module.exports = merge(base, {
  mode: "development",
  devServer: {
    host: "0.0.0.0",
    port: 3000,
    hot: true,
    allowedHosts: ["frontend", "localhost", "127.0.0.1"],
    historyApiFallback: true,
    proxy: {
      "/_metadata/cloud-regions.json": {
        bypass: (req, res, _options) => {
          // For some reason webpack dev server invokes this proxy for _all_ routes that aren't handled
          //   by the above. Verify that we're actually receiving a request for the region before
          //   manipulating the response.
          if (req.url !== "/_metadata/cloud-regions.json") {
            return null;
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(cloudRegions));
        },
      },
    },
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
