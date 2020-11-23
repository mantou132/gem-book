import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import fs from 'fs';
import { EventEmitter } from 'events';
import { BookConfig } from '../common/config';

interface BuilderOptions {
  dir: string;
  debug: boolean;
  outputFe: boolean;
}

export const builderEventTarget = new EventEmitter();

export function startBuilder(options: BuilderOptions, bookConfig: Partial<BookConfig>) {
  const { dir, debug, outputFe } = options;
  const output = path.resolve(dir);
  builderEventTarget.on('update', () => {
    fs.writeFileSync(path.resolve(__dirname, '../src/website/update.log'), String(Date.now()));
  });
  const compiler = webpack({
    mode: debug ? 'development' : 'production',
    entry: {
      bundle: [path.resolve(__dirname, '../src/website/update.log'), path.resolve(__dirname, '../src/website')],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: [
            {
              loader: path.resolve(__dirname, '../node_modules/ts-loader'),
              options: {
                configFile: path.resolve(__dirname, '../tsconfig.json'),
              },
            },
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      path: output,
      publicPath: '/',
      filename: '[name].js?[contenthash]',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: bookConfig.title || 'Gem-book App',
        favicon: bookConfig.icon && path.join(output, bookConfig.icon),
      }),
      new webpack.DefinePlugin({
        get ['process.env.BOOK_CONFIG']() {
          return JSON.stringify(JSON.stringify(bookConfig));
        },
      }),
    ],
    devtool: debug && 'source-map',
  });
  if (outputFe) {
    compiler.run((err, stats) => {
      if (err) {
        console.error(err.stack || err);
        return;
      }

      const info = stats.toJson();

      if (stats.hasErrors()) {
        console.error(info.errors.join());
      }

      if (stats.hasWarnings()) {
        console.warn(info.warnings.join());
      }
    });
  } else {
    // https://github.com/webpack/webpack-dev-server/blob/master/examples/api/simple/server.js
    const server = new WebpackDevServer(compiler, {
      contentBase: path.resolve(dir),
      historyApiFallback: true,
      open: true,
    });
    server.listen(Number(process.env.PORT) || 0, function (err) {
      if (err) {
        console.error(err);
      }
    });
  }
}
