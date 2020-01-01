const R = require('ramda');
const NodemonPlugin = require('nodemon-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const {resolve} = require('path');

const OUTPUT_FOLDER = resolve(__dirname, '../dist');
const MANIFEST_NAME = 'public-manifest.json';
const SERVER_FILENAME = 'server.js';

const createWebpackConfig = require('./utils/createWebpackConfig');

const resolveSource = path => resolve(__dirname, `../src/${path}`);

const SHARED_ALIASES = R.mapObjIndexed(
  resolveSource,
  {
    '@pkg/resource-pack': 'packages/resource-pack/src/',
    '@pkg/gl-math': 'packages/gl-math/src/',
    '@pkg/basic-helpers': 'packages/basic-helpers/src/',
    '@pkg/isometric-renderer': 'packages/isometric-renderer/src/',
    '@pkg/ctx': 'packages/ctx-utils/src',
    '@pkg/struct-pack': 'packages/struct-pack/src/',
    '@pkg/physics': 'packages/physics-scene/src/',

    '@ui/basic-hooks': 'packages/ui/basic-hooks/src/',
    '@ui/basic-components': 'packages/ui/basic-components/src/',
    '@ui/schemas': 'packages/ui/basic-type-schemas/src/schemas',
    '@ui/colors': 'packages/ui/basic-type-schemas/src/colors',
    '@ui/i18n': 'packages/ui/i18n/src/',

    '@game/res': 'public/res/',
    '@game/server-res': 'server/res/',
    '@game/public': 'public/',
    '@game/network': 'network/',
    '@game/screens': 'network/client/gameplay/screens/',
    '@game/server': 'network/server/',
    '@game/shared': 'network/shared/',
    '@game/logic': 'network/shared/logic/',
    '@game/i18n': 'lang/',
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
    },
  ),

  createWebpackConfig(
    {
      target: 'node',
      alias: SHARED_ALIASES,
      entry: [
        'source-map-support/register',
        resolveSource('server/index.jsx'),
      ],
      outputFolder: resolve(OUTPUT_FOLDER, 'api'),
      outputName: SERVER_FILENAME,
      plugins: [
        new CopyPlugin([
          {
            from: resolve(__dirname, '../src/server/res/maps/'),
            to: resolve(__dirname, '../dist/api/res/maps/'),
          },
          {
            from: resolve(__dirname, '../src/server/res/recordings/'),
            to: resolve(__dirname, '../dist/api/res/recordings/'),
          },
        ]),
        ...(
          process.env.NODE_ENV === 'development'
            ? [
              new NodemonPlugin(
                {
                  ignore: ['*.json'],
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
