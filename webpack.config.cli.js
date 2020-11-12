const path = require('path');
const nodeExternals = require('webpack-node-externals');

/**
 * @type {import('webpack/declarations/WebpackOptions').WebpackOptions}
 */
module.exports = {
  mode: 'development',
  target: 'node',
  entry: `./src/bin`,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
  },
  output: {
    path: path.resolve(__dirname, 'bin'),
    filename: 'index.js',
  },
  externals: [nodeExternals()],
  devtool: 'source-map',
};
