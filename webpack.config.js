const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * @type {import('webpack/declarations/WebpackOptions').WebpackOptions}
 */
module.exports = {
  entry: `./src/website`,
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve('./docs'),
    publicPath: '/',
    filename: 'bundle.js?[contenthash]',
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Gem-book',
      favicon: './docs/logo.png',
    }),
  ],
  devServer: {
    contentBase: './docs',
    historyApiFallback: true,
  },
  devtool: 'source-map',
};
