import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { GenerateSW } from 'workbox-webpack-plugin';
import path from 'path';
import { writeFileSync, symlinkSync, renameSync } from 'fs';
import { EventEmitter } from 'events';
import { BookConfig, CliUniqueConfig } from '../common/config';
import { resolveLocalPlugin, resolveTheme, isURL } from './utils';
import { DEV_THEME_FILE, STATS_FILE } from '../common/constant';

export const builderEventTarget = new EventEmitter();

const entryDir = path.resolve(__dirname, '../src/website');
const pluginDir = path.resolve(__dirname, '../src/plugins');
const updateLog = path.resolve(entryDir, './update.log');
const update = () => {
  writeFileSync(updateLog, String(Date.now()));
};

// dev mode uses memory file system
export function startBuilder(dir: string, options: Required<CliUniqueConfig>, bookConfig: Partial<BookConfig>) {
  update();
  builderEventTarget.on('update', update);

  const { debug, build, theme, template, output, icon, plugin: plugins, ga } = options;

  if (path.extname(output) === '.json') {
    return;
  }

  plugins.forEach((plugin) => {
    const localPath = resolveLocalPlugin(plugin);
    if (localPath) {
      const filename = path.basename(localPath);
      const uniqueFilename = filename + Date.now();
      symlinkSync(localPath, path.resolve(pluginDir, uniqueFilename));
      renameSync(path.resolve(pluginDir, uniqueFilename), path.resolve(pluginDir, filename));
    }
  });

  const isRemoteIcon = isURL(icon);
  const docsDir = path.resolve(dir);
  const outputDir = output ? path.resolve(output) : docsDir;
  const { themeObject, resolveThemePath } = resolveTheme(theme);
  const compiler = webpack({
    mode: build ? 'production' : 'development',
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
      extensions: ['.ts', '.js'],
      fallback: {
        perf_hooks: false,
        path: false,
      },
    },
    output: {
      path: outputDir,
      publicPath: '/',
      filename: '[name].bundle.js?[contenthash]',
      chunkFilename: '[name].bundle.js?[contenthash]',
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        title: bookConfig.title || 'Gem-book App',
        ...(template ? { template: path.resolve(process.cwd(), template) } : undefined),
        // Automatically copied to the output directory
        favicon: !isRemoteIcon && icon,
        meta: {
          viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
        },
      }),
      new webpack.DefinePlugin({
        // dev mode
        'process.env.DEV_MODE': !build,
        // build mode
        'process.env.BOOK_CONFIG': JSON.stringify(JSON.stringify(bookConfig)),
        'process.env.THEME': JSON.stringify(JSON.stringify(themeObject)),
        'process.env.PLUGINS': JSON.stringify(JSON.stringify(plugins)),
        'process.env.GA_ID': JSON.stringify(ga),
      }),
      new CopyWebpackPlugin({
        patterns: [{ from: path.resolve(entryDir, 'robots.txt'), to: outputDir }],
      }),
      new GenerateSW(),
    ]
      .concat(
        outputDir !== docsDir
          ? new CopyWebpackPlugin({
              patterns: [{ from: docsDir, to: outputDir }],
            })
          : ([] as any),
      )
      .concat(
        !build && resolveThemePath
          ? new CopyWebpackPlugin({
              patterns: [
                {
                  from: resolveThemePath,
                  to: path.resolve(outputDir, DEV_THEME_FILE),
                  transform: () => JSON.stringify(themeObject),
                },
              ],
            })
          : ([] as any),
      ),
    devtool: debug && 'source-map',
  });
  if (build) {
    compiler.run((err, stats) => {
      if (err) {
        console.error(err.stack || err);
        return;
      }

      if (!stats) return;

      const info = stats.toJson();

      if (stats.hasErrors()) {
        console.error(info.errors);
      }

      if (stats.hasWarnings()) {
        console.warn(info.warnings);
      }

      if (debug) {
        writeFileSync(path.resolve(outputDir, STATS_FILE), JSON.stringify(stats.toJson({ colors: true }), null, 2));
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
