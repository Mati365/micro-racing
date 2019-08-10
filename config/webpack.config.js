const R = require('ramda');
const NodemonPlugin = require('nodemon-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {resolve} = require('path');

const OUTPUT_FOLDER = resolve(__dirname, '../dist');
const MANIFEST_NAME = 'public-manifest.json';
const SERVER_FILENAME = 'server.js';

const createWebpackConfig = require('./utils/createWebpackConfig');

const resolveSource = path => resolve(__dirname, `../src/${path}`);

const SHARED_ALIASES = R.mapObjIndexed(
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
    '@game/network': 'network/',
  },
);

module.exports = [
  createWebpackConfig(
    {
      publicPath: 'static/',
      target: 'web',
      alias: SHARED_ALIASES,
      manifestName: MANIFEST_NAME,
      entry: resolveSource('public/src/index.jsx'),
      outputFolder: resolve(OUTPUT_FOLDER, 'public'),
      plugins: [
        new CleanWebpackPlugin,
      ],
    },
  ),

  createWebpackConfig(
    {
      target: 'node',
      alias: SHARED_ALIASES,
      entry: resolveSource('server/index.jsx'),
      outputFolder: resolve(OUTPUT_FOLDER, 'api'),
      outputName: SERVER_FILENAME,
      plugins: [
        new CleanWebpackPlugin,
        ...(
          process.env.NODE_ENV === 'development'
            ? [
              new NodemonPlugin(
                {
                  watch: [
                    resolve(OUTPUT_FOLDER),
                  ],
                },
              ),
            ]
            : []
        ),
      ],
    },
  ),
];
