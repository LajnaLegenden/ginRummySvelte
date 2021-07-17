var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
/* const CopyPlugin = require("copy-webpack-plugin");
 */
var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function (x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function (mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: './src/app.ts',
  target: 'node',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'eval-source-map',
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts']
  },
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  },
  externals: nodeModules,
  /* plugins: [
    new CopyPlugin({
      patterns: [
        { from: "./src/views", to: "./views" },
        { from: "./src/images", to: "./images" },
        { from: "./../web/src/locales", to: "./locales", noErrorOnMissing: true},
        { from: "/src/web/src/locales", to: "./locales", noErrorOnMissing: true}
      ],
    }),
  ], */
};