const {resolve} = require('path');
const R = require('ramda');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const OUTPUT_FOLDER = resolve(__dirname, '../dist');

const resolveSource = folder => resolve(__dirname, `../src/${folder}`);

module.exports = {
  devtool: 'eval-source-map',
  entry: {
    main: resolveSource('public/src/index.jsx'),
  },
  output: {
    path: OUTPUT_FOLDER,
    filename: '[name]-[hash].js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [
      resolve(__dirname, '../node_modules'),
      resolve(__dirname, '../src'),
    ],
    alias: R.mapObjIndexed(
      resolveSource,
      {
        '@pkg/schemas': 'packages/basic-type-schemas/src/',
        '@pkg/resource-pack': 'packages/resource-pack/src/',
        '@pkg/gl-math': 'packages/gl-math/src/',
        '@pkg/basic-helpers': 'packages/basic-helpers/src/',
        '@pkg/isometric-renderer': 'packages/isometric-renderer/src/',
        '@pkg/ctx': 'packages/ctx-utils/src',
        '@pkg/struct-pack': 'packages/struct-pack/src/',
        '@game/res': 'public/res/',
        '@game/public': 'public/',
        '@game/server': 'server/',
        '@game/shared': 'shared/',
      },
    ),
  },
  plugins: [
    new HtmlWebpackPlugin(
      {
        template: resolveSource('public/res/index.pug'),
        filename: 'index.html',
      },
    ),
    new webpack.HotModuleReplacementPlugin,
  ],
  devServer: {
    port: 3000,
    hot: true,
    inline: true,
    watchContentBase: true,
    compress: true,
    historyApiFallback: true,
    contentBase: OUTPUT_FOLDER,
    publicPath: '/',
  },
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
};
