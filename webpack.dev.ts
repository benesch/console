import "webpack-dev-server";

import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import { DefinePlugin } from "webpack";
import { merge } from "webpack-merge";

import localOutputs from "../config/settings/local.outputs.json";
import { CloudRegion } from "./src/types";
import base, { IDefinePluginOptions, statuspageId } from "./webpack.config";

let fronteggUrl;
let backendUrl;
let environmentdScheme;
let cloudRegions: CloudRegion[];

if (process.env.PROXY_STACK) {
  let stack = process.env.PROXY_STACK;
  if (stack !== "staging") {
    stack += ".staging";
  }
  fronteggUrl = `https://admin.${stack}.cloud.materialize.com`;
  backendUrl = `https://legacy.${stack}.cloud.materialize.com`;
  environmentdScheme = "https";
  cloudRegions = [
    // TODO: pull the regions that are active for a stack from
    // Pulumi.$stack.yaml, rather than hardcoding them here.
    {
      provider: "aws",
      region: "us-east-1",
      regionControllerUrl: `https://rc.us-east-1.aws.${stack}.cloud.materialize.com`,
    },
    {
      provider: "aws",
      region: "eu-west-1",
      regionControllerUrl: `https://rc.eu-west-1.aws.${stack}.cloud.materialize.com`,
    },
  ];
} else {
  fronteggUrl = localOutputs.frontegg_url;
  backendUrl = process.env.BACKEND_URL || "http://[::1]:8000";
  environmentdScheme = "http";
  cloudRegions = [
    {
      provider: "local",
      region: "kind",
      regionControllerUrl: "http://localhost:8002",
    },
  ];
}

const definePluginOptions: IDefinePluginOptions = {
  __FRONTEGG_URL__: JSON.stringify(fronteggUrl),
  __LAUNCH_DARKLY_KEY__: JSON.stringify("6388e8b9750ee71144183456"),
  __SEGMENT_API_KEY__: JSON.stringify("dGeQYRjmGVsqDI0KIARrAhTvk1BdJJhk"),
  __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN || null),
  __SENTRY_ENVIRONMENT__: JSON.stringify(
    process.env.SENTRY_ENVIRONMENT || null
  ),
  __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE || null),
  __STATUSPAGE_ID__: JSON.stringify(statuspageId),
  __GOOGLE_ANALYTICS_ID__: JSON.stringify(null),
  __ENVIRONMENTD_SCHEME__: JSON.stringify(environmentdScheme),
  __CLOUD_REGIONS__: JSON.stringify(cloudRegions),
  __RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED__: JSON.stringify(true),
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
