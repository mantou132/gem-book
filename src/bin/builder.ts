import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';
import fs from 'fs';
import { EventEmitter } from 'events';
import { BookConfig } from '../common/config';
import { inTheDir, isURL } from './utils';

interface BuilderOptions {
  dir: string;
  output: string;
  debug: boolean;
  devMode: boolean;
  htmlTemplate: string;
  iconPath: string;
  plugins: string;
}

export const builderEventTarget = new EventEmitter();

const entryDir = path.resolve(__dirname, '../src/website');
const updateLog = path.resolve(entryDir, './update.log');
const update = () => {
  fs.writeFileSync(updateLog, String(Date.now()));
};

export function startBuilder(options: BuilderOptions, bookConfig: Partial<BookConfig>) {
  update();
  builderEventTarget.on('update', update);

  const { dir, debug, devMode, htmlTemplate: html, output, iconPath, plugins } = options;

  if (path.extname(output) === '.json') {
    return;
  }

  const isRemoteIcon = isURL(iconPath);
  const docsDir = path.resolve(dir);
  const outputDir = output ? path.resolve(output) : docsDir;
  const compiler = webpack({
    mode: devMode ? 'development' : 'production',
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
      path: outputDir,
      publicPath: '/',
      filename: 'bundle.js?[contenthash]',
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: bookConfig.title || 'Gem-book App',
        favicon: !isRemoteIcon && iconPath,
        ...(html ? { template: path.resolve(process.cwd(), html) } : undefined),
      }),
      new webpack.DefinePlugin({
        // dev mode
        'process.env.DEV_MODE': devMode,
        // build mode
        'process.env.BOOK_CONFIG': JSON.stringify(JSON.stringify(bookConfig)),
        'process.env.PLUGINS': JSON.stringify(plugins),
      }),
    ].concat(
      outputDir !== docsDir
        ? new CopyWebpackPlugin({
            patterns: [{ from: docsDir, to: outputDir }].concat(
              !isRemoteIcon && !inTheDir(outputDir, iconPath) ? { from: iconPath, to: outputDir } : [],
            ),
          })
        : [],
    ),
    devtool: debug && 'source-map',
  });
  if (devMode) {
    // https://github.com/webpack/webpack-dev-server/blob/master/examples/api/simple/server.js
    const server = new WebpackDevServer(compiler, {
      contentBase: path.resolve(dir),
      historyApiFallback: true,
      open: process.env.PORT ? false : true,
    });
    server.listen(Number(process.env.PORT) || 0, (err) => {
      if (err) {
        console.error(err);
      }
    });
  } else {
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
  }
}
