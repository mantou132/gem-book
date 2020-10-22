const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * @type {import('webpack/declarations/WebpackOptions').WebpackOptions}
 */
module.exports = {
  entry: `./docs`,
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              declaration: false,
              declarationMap: false,
            },
          },
        },
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
      favicon: './docs/logo.png',
    }),
  ],
  devServer: {
    contentBase: './docs',
    historyApiFallback: true,
  },
  devtool: 'source-map',
};
