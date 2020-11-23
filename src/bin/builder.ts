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

const entryDir = path.resolve(__dirname, '../src/website');
const updateLog = path.resolve(entryDir, './update.log');
const update = () => {
  fs.writeFileSync(updateLog, String(Date.now()));
};

export function startBuilder(options: BuilderOptions, bookConfig: Partial<BookConfig>) {
  const { dir, debug, outputFe } = options;
  const output = path.resolve(dir);
  update();
  builderEventTarget.on('update', update);
  const compiler = webpack({
    mode: debug ? 'development' : 'production',
    entry: [updateLog, entryDir],
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: path.resolve(__dirname, '../node_modules/ts-loader'),
              options: {
                configFile: path.resolve(__dirname, '../tsconfig.json'),
                // Install cli without installing dev @types dependency
                transpileOnly: true,
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
      filename: 'bundle.js?[contenthash]',
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
      open: process.env.PORT ? false : true,
    });
    server.listen(Number(process.env.PORT) || 0, function (err) {
      if (err) {
        console.error(err);
      }
    });
  }
}
