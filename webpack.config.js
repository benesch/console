const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  resolve: {
    extensions: [ ".tsx", ".ts", ".js" ],
    fallback: {
      // amazon-cognito-identity-js attempts to require('crypto'). Webpack v4
      // used to automatically provide a polyfill but from v5 onwards we need
      // to specify the fallback explicitly
      "crypto": false,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          // type checking offered by fork-ts-checker
          transpileOnly: true
        }
      },
      {
        // Needed to load some dependencies that don't have well formed import paths
        // See https://github.com/webpack/webpack/issues/11467#issuecomment-691873586
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        type: "asset",
      },
    ]
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Materialize Cloud"
    }),
  ],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
