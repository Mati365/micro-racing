import React from 'react';
import ReactDOMServer from 'react-dom/server';

import {resolve} from 'path';
import express from 'express';
import consola from 'consola';
import http from 'http';

import BASIC_NEURAL_AI from '@game/server-res/ai/basic-ai.json';
import BASIC_NEURAL_AI_2 from '@game/server-res/ai/basic-ai-2.json';
import BASIC_NEURAL_AI_3 from '@game/server-res/ai/basic-ai-3.json';
import BASIC_NEURAL_AI_4 from '@game/server-res/ai/basic-ai-4.json';
import BASIC_NEURAL_AI_5 from '@game/server-res/ai/basic-ai-5.json';

import {GAME_LANG_PACK} from '@game/i18n';
import {SERVER_PORT} from '@game/network/constants/runtimeConfig';

import assignI18nPackMiddleware from '@ui/i18n/server/assignLangPackMiddleware';

import CacheStoreReactMetatags from '@pkg/fast-stylesheet/src/react/server/CacheStoreReactMetatags';
import {
  criticalSheetStore,
  createHydratedSheetStore,
  SheetStoreContextProvider,
} from '@pkg/fast-stylesheet/src/react';

import GameServer from '@game/network/server/Server';
import RootContainer from '../public/src/RootContainer';
import ProvideGlobalJSON from './components/ProvideGlobalJSON';

import staticManifest from './constants/staticManifest';

import serveCompressed from './middlewares/serveCompressed';
import {
  loadMapsDirectory,
  writeAiPopulation,
  writeTrackRecording,
} from './utils';

const CRITICAL_SHEET_STORE_DUMP = criticalSheetStore.dump();
const PUBLIC_PATH = resolve(__dirname, '../public');

const app = express();
const server = http.createServer(app);

(async () => {
  const maps = await loadMapsDirectory(
    {
      dir: resolve(__dirname, 'res/maps/'),
    },
  );

  new GameServer(
    {
      maps,
      socketOptions: {
        server,
      },
      neurals: [
        BASIC_NEURAL_AI,
        BASIC_NEURAL_AI_2,
        BASIC_NEURAL_AI_3,
        BASIC_NEURAL_AI_4,
        BASIC_NEURAL_AI_5,
      ],
      onDumpTrackRecord: (...args) => writeTrackRecording(
        {
          filename: resolve(__dirname, `res/recordings/recording-${Date.now()}.json`),
        },
        ...args,
      ),
      onDumpTrainingPopulation: writeAiPopulation(
        {
          filename: resolve(__dirname, 'res/ai/cars-ai.json'),
        },
      ),
    },
  ).start();
})();

app.get(
  '*.js',
  serveCompressed(
    {
      publicPath: PUBLIC_PATH,
      contentType: 'text/javascript',
    },
  ),
);

app.get(
  '*.css',
  serveCompressed(
    {
      publicPath: PUBLIC_PATH,
      contentType: 'text/css',
    },
  ),
);

app
  .use(
    '/static',
    express.static(
      PUBLIC_PATH,
      {
        immutable: true,
        maxAge: '30min',
      },
    ),
  )

  .get('*', assignI18nPackMiddleware(GAME_LANG_PACK), (req, res) => {
    const {i18n} = res.locals;
    const dynamicSheetStore = createHydratedSheetStore({id: 'd'});

    const context = {};
    const html = (
      <html lang='en'>
        <head>
          <CacheStoreReactMetatags />
        </head>

        <body>
          <div id='hydration-container'>
            <SheetStoreContextProvider value={dynamicSheetStore}>
              <RootContainer
                i18n={i18n}
                routerProps={{
                  location: req.url,
                  context,
                }}
              />
            </SheetStoreContextProvider>
          </div>

          <ProvideGlobalJSON
            value={{
              i18n,
            }}
          />
          <script src={staticManifest['main.js']} />
        </body>
      </html>
    );

    if (context.url)
      res.redirect(302, context.url);
    else {
      res.send(
        CacheStoreReactMetatags.insertToHTML(
          [
            CRITICAL_SHEET_STORE_DUMP,
            dynamicSheetStore,
          ],
          `<!doctype html>${ReactDOMServer.renderToString(html)}`,
        ),
      );
    }
  });

server.listen(
  SERVER_PORT,
  () => {
    consola.info(`Server is running! Check http://lvh.me:${SERVER_PORT}!`);
  },
);
