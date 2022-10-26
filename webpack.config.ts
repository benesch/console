import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import { Configuration, DefinePlugin } from "webpack";

const additionalPlugins = [];
let additionalTSOptions: { [index: string]: any } = {};

if (process.env.SOURCE_MAPS) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SentryPlugin = require("@sentry/webpack-plugin");
  additionalPlugins.push(
    new SentryPlugin({
      include: path.resolve(__dirname, "dist", "frontend"),
      org: "materializeinc",
      project: "cloud-frontend",
      release: process.env.SENTRY_RELEASE,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      __SENTRY_DEBUG__: false,
    })
  );

  // Ensure the Typescript compiler knows to generate source maps
  additionalTSOptions = require("./tsconfig.json");
  additionalTSOptions.compilerOptions.sourceMap = true;
}

const HtmlWebpackPluginOptions: HtmlWebpackPlugin.Options = {
  favicon: "public/favicon.ico",
  template: "public/index.html",
};

// Webpack doesn't export this type, so extract it from the function
type RuntimeValue = ReturnType<typeof DefinePlugin.runtimeValue>;

export interface IDefinePluginOptions
  extends Record<string, string | RuntimeValue> {
  __FRONTEGG_URL__: string | RuntimeValue;
  __SEGMENT_API_KEY__: string;
  __SENTRY_DSN__: string;
  __SENTRY_ENVIRONMENT__: string;
  __SENTRY_RELEASE__: string;
  __STATUSPAGE_ID__: string;
  __GOOGLE_ANALYTICS_ID__: string;
  __RELEASE_NOTES_ROOT_URL__: string;
  __LAST_RELEASE_NOTE_ID__: string;
  __IS_DEVELOPMENT__: string;
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
          compilerOptions: {
            sourceMap:
              process.env.NODE_ENV !== "production" || process.env.SOURCE_MAPS,
          },
          ...additionalTSOptions,
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
  plugins: [
    new HtmlWebpackPlugin(HtmlWebpackPluginOptions),
    new MiniCssExtractPlugin(),
    ...additionalPlugins,
  ],
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
  devtool:
    process.env.NODE_ENV === "production" ? "source-map" : "eval-source-map",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist", "frontend"),
    publicPath: "auto",
  },
};

export default config;
