const path = require('path');
const base = require('./webpack.config.js');
const { merge } = require('webpack-merge');

module.exports = merge(base, {
  mode: 'development',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    host: '0.0.0.0',
    port: 3000,
    historyApiFallback: true,
    hot: true,
    allowedHosts: ["frontend", "localhost"],
  },
  // https://github.com/webpack/webpack-dev-server/issues/2758#issuecomment-751445974
  target: "web",
});
