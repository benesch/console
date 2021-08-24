import "webpack-dev-server";

import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import path from "path";
import { merge } from "webpack-merge";

import base from "./webpack.config";

module.exports = merge(base, {
  mode: "development",
  devServer: {
    static: {
      directory: path.join(__dirname, "dist", "frontend"),
      publicPath: "/static/frontend/",
    },
    host: "0.0.0.0",
    port: 3000,
    hot: true,
    allowedHosts: ["frontend", "localhost"],
  },
  devtool: "inline-cheap-module-source-map",
  // https://github.com/webpack/webpack-dev-server/issues/2758#issuecomment-751445974
  target: "web",
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new ReactRefreshWebpackPlugin({
      overlay: { sockPort: 3000 },
    }),
  ],
});
