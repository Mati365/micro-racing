import React from 'react';
import ReactDOMServer from 'react-dom/server';

import {resolve} from 'path';
import express from 'express';
import consola from 'consola';

import {GAME_LANG_PACK} from '@game/i18n';
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
import {
  loadMapsDirectory,
  loadAiRecordingsDirectory,
  writeAiPopulation,
  writeTrackRecording,
} from './utils';

const APP_PORT = 3000;

const CRITICAL_SHEET_STORE_DUMP = criticalSheetStore.dump();

const app = express();

(async () => {
  const maps = await loadMapsDirectory(
    {
      dir: resolve(__dirname, 'res/maps/'),
    },
  );

  const {neural} = await loadAiRecordingsDirectory(
    {
      dir: resolve(__dirname, 'res/recordings/'),
    },
  );

  new GameServer(
    {
      maps,
      neurals: [neural],
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

app
  .use(
    '/static',
    express.static(resolve(__dirname, '../public')),
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

app.listen(
  APP_PORT,
  () => {
    consola.info(`Server is running! Check http://lvh.me:${APP_PORT}!`);
  },
);
