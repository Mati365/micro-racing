import ReactDOM from 'react-dom';
import React from 'react';

import * as T from '@pkg/neural-network';
import {createCarNeuralNetwork} from '@game/network/shared/logic/drivers/neural/CarNeuralAI';

import {
  createHydratedSheetStore,
  SheetStoreContextProvider,
} from '@pkg/fast-stylesheet/src/react';

import RootContainer from './RootContainer';

import {DEFAULT_GLOBAL_JSON_NAME} from '../../server/components/ProvideGlobalJSON';

const recording = [
  {
    inputs: [0, 0, 0],
    outputs: [1, 1],
  },
  {
    inputs: [0, 1, 0],
    outputs: [1, 0],
  },
  {
    inputs: [0, 1, 1],
    outputs: [0, 0],
  },
  {
    inputs: [1, 1, 1],
    outputs: [0, 1],
  },
];

const network = T.trainNetwork(recording, 0.5, 100, createCarNeuralNetwork(1));
console.log(T.exec([0, 1, 0], network));

ReactDOM.render(
  <SheetStoreContextProvider value={createHydratedSheetStore({id: 'd'})}>
    <RootContainer i18n={window[DEFAULT_GLOBAL_JSON_NAME].i18n} />
  </SheetStoreContextProvider>,
  document.getElementById('hydration-container'),
);
