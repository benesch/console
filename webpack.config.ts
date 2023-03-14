import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import { Configuration } from "webpack";

export const statuspageId = "qf52z1jnw4q8";

const HtmlWebpackPluginOptions: HtmlWebpackPlugin.Options = {
  favicon: "public/favicon.ico",
  template: "public/index.html",
};

export interface IDefinePluginOptions
  extends Record<string, string | undefined> {
  __LAUNCH_DARKLY_KEY__: string;
  __SEGMENT_API_KEY__: string;
  __SENTRY_DSN__: string;
  __SENTRY_ENVIRONMENT__: string;
  __SENTRY_RELEASE__: string;
  __STATUSPAGE_ID__: string;
  __DEFAULT_STACK__: string;
  __FORCE_OVERRIDE_STACK__: string | undefined;
  __RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED__: string;
}

const config: Configuration = {
  entry: "./src/index.tsx",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "~/img": path.resolve(__dirname, "img"),
      "~": path.resolve(__dirname, "src"),
    },
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
          configFile: "../tsconfig.json",
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
    filename: "[name].[contenthash:8].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "auto",
  },
};

export default config;
