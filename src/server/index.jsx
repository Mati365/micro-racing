import React from 'react';
import ReactDOMServer from 'react-dom/server';

import {resolve} from 'path';
import express from 'express';
import consola from 'consola';

import GameServer from '@game/network/server/Server';
import staticManifest from './constants/staticManifest';

const APP_PORT = 3000;

const app = express();

new GameServer().start();

app
  .use(
    '/static',
    express.static(resolve(__dirname, '../public')),
  )
  .get('/', (req, res) => {
    res.send(
      ReactDOMServer.renderToString(
        <html lang='en'>
          <head>
            <style
              dangerouslySetInnerHTML={{
                __html: 'html, body { margin: 0; padding: 0; }',
              }}
            />
          </head>

          <body>
            <div
              id='app-root'
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
              }}
            />
            <script src={staticManifest['main.js']} />
          </body>
        </html>,
      ),
    );
  });

app.listen(
  APP_PORT,
  () => {
    consola.info(`Server is running! Check http://lvh.me:${APP_PORT}!`);
  },
);
