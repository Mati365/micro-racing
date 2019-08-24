import ReactDOM from 'react-dom';
import React from 'react';

import {
  createHydratedSheetStore,
  SheetStoreContextProvider,
} from '@pkg/fast-stylesheet/src/react';

import RootContainer from './RootContainer';

ReactDOM.render(
  <SheetStoreContextProvider value={createHydratedSheetStore({id: 'd'})}>
    <RootContainer />
  </SheetStoreContextProvider>,
  document.getElementById('hydration-container'),
);
