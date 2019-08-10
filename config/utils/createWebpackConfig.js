const {resolve} = require('path');
const nodeExternals = require('webpack-node-externals');
const ManifestPlugin = require('webpack-manifest-plugin');

const createWebpackConfig = ({
  plugins = [],
  target,
  alias,
  entry,
  publicPath,
  outputFolder,
  outputName,
  manifestName,
}) => ({
  target,
  externals: (
    target === 'node'
      ? [nodeExternals(
        {
          whitelist: [
            /^@pkg*/,
          ],
        },
      )]
      : []
  ),
  node: {
    __dirname: false,
    __filename: false,
  },

  devtool: 'eval-source-map',
  entry,
  output: {
    publicPath,
    path: outputFolder,
    filename: outputName || '[name]-[hash].js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [
      resolve('node_modules'),
      resolve('src'),
    ],
    alias,
  },
  plugins: [
    ...plugins,
    ...(
      manifestName
        ? [new ManifestPlugin(
          {
            fileName: manifestName,
            publicPath,
            writeToFileEmit: true,
          },
        )]
        : []
    ),
  ],
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: ['raw-loader', 'pug-html-loader'],
      },
      {
        enforce: 'pre',
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          emitError: false,
        },
      },
      {
        test: /\.(png|jpg|gif|obj|mtl)$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              // polyfill for new browser
              '@babel/preset-env',
              '@babel/preset-react', // react jsx compiler
            ],
            plugins: [
              ['@babel/plugin-transform-runtime',
                {
                  regenerator: true,
                },
              ],
              '@babel/plugin-transform-named-capturing-groups-regex',
              '@babel/plugin-proposal-nullish-coalescing-operator',
              '@babel/plugin-proposal-optional-chaining',
              '@babel/plugin-proposal-logical-assignment-operators',
              '@babel/plugin-proposal-do-expressions',
              '@babel/plugin-proposal-function-bind',
              [
                '@babel/plugin-proposal-pipeline-operator',
                {
                  proposal: 'minimal',
                },
              ],
              [
                '@babel/plugin-proposal-decorators',
                {
                  legacy: true,
                },
              ],
              [
                '@babel/plugin-proposal-class-properties',
                {
                  loose: true,
                },
              ],
            ],
          },
        },
      },
    ],
  },
});

module.exports = createWebpackConfig;
