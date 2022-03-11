import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import { Configuration } from "webpack";

const additionalPlugins = [];
if (process.env.SENTRY_RELEASE) {
  const SentryPlugin = require("@sentry/webpack-plugin");
  additionalPlugins.push(new SentryPlugin({
    include: path.resolve(__dirname, "dist", "frontend"),
    org: 'materializeinc',
    project: 'cloud-frontend',
    release: process.env.SENTRY_RELEASE,
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }));

}

const config: Configuration = {
  entry: "./src/index.tsx",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          // Type checking is provided by fork-ts-checker.
          transpileOnly: true,
          // compilerOptions: { "sourceMap": true }
        },
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        type: "asset",
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin(), ...additionalPlugins],
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: "styles",
          type: "css/mini-extract",
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
  devtool: "source-map",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist", "frontend"),
    publicPath: "/static/frontend/",
  },
};

export default config;
