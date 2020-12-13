import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';
import fs from 'fs';
import { EventEmitter } from 'events';
import { BookConfig } from '../common/config';
import { resolveTheme, isURL } from './utils';
import { DEV_THEME_FILE, STATS_FILE } from '../common/constant';

interface BuilderOptions {
  dir: string;
  output: string;
  debugMode: boolean;
  buildMode: boolean;
  themePath: string;
  templatePath: string;
  iconPath: string;
  plugins: string[];
  ga: string;
}

export const builderEventTarget = new EventEmitter();

const entryDir = path.resolve(__dirname, '../src/website');
const updateLog = path.resolve(entryDir, './update.log');
const update = () => {
  fs.writeFileSync(updateLog, String(Date.now()));
};

// dev mode uses memory file system
export function startBuilder(options: BuilderOptions, bookConfig: Partial<BookConfig>) {
  update();
  builderEventTarget.on('update', update);

  const { dir, debugMode, buildMode, themePath, templatePath, output, iconPath, plugins, ga } = options;

  if (path.extname(output) === '.json') {
    return;
  }

  const isRemoteIcon = isURL(iconPath);
  const docsDir = path.resolve(dir);
  const outputDir = output ? path.resolve(output) : docsDir;
  const { theme, resolveThemePath } = resolveTheme(themePath);
  const compiler = webpack({
    mode: buildMode ? 'production' : 'development',
    entry: [updateLog, entryDir],
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: [
            {
              loader: __non_webpack_require__.resolve('ts-loader'),
              options: {
                configFile: path.resolve(__dirname, '../tsconfig.json'),
                // Install cli without installing dev @types dependency
                transpileOnly: true,
                compilerOptions: {
                  module: 'esnext',
                },
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
        ...(templatePath ? { template: path.resolve(process.cwd(), templatePath) } : undefined),
        // Automatically copied to the output directory
        favicon: !isRemoteIcon && iconPath,
        meta: {
          viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
        },
      }),
      new webpack.DefinePlugin({
        // dev mode
        'process.env.DEV_MODE': !buildMode,
        // build mode
        'process.env.BOOK_CONFIG': JSON.stringify(JSON.stringify(bookConfig)),
        'process.env.THEME': JSON.stringify(JSON.stringify(theme)),
        'process.env.PLUGINS': JSON.stringify(JSON.stringify(plugins)),
        'process.env.GA_ID': JSON.stringify(ga),
      }),
    ]
      .concat(
        outputDir !== docsDir
          ? new CopyWebpackPlugin({
              patterns: [{ from: docsDir, to: outputDir }],
            })
          : [],
      )
      .concat(
        !buildMode && resolveThemePath
          ? new CopyWebpackPlugin({
              patterns: [
                {
                  from: resolveThemePath,
                  to: path.resolve(outputDir, DEV_THEME_FILE),
                  transform: () => JSON.stringify(theme),
                },
              ],
            })
          : [],
      ),
    devtool: debugMode && 'source-map',
  });
  if (buildMode) {
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

      if (debugMode) {
        fs.writeFileSync(path.resolve(outputDir, STATS_FILE), JSON.stringify(stats.toJson({}, true), null, 2));
      }
    });
  } else {
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
  }
}
