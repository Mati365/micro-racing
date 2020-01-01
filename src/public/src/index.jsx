import ReactDOM from 'react-dom';
import React from 'react';

import {
  createHydratedSheetStore,
  SheetStoreContextProvider,
} from '@pkg/fast-stylesheet/src/react';

import RootContainer from './RootContainer';
import {DEFAULT_GLOBAL_JSON_NAME} from '../../server/components/ProvideGlobalJSON';

ReactDOM.render(
  <SheetStoreContextProvider value={createHydratedSheetStore({id: 'd'})}>
    <RootContainer i18n={window[DEFAULT_GLOBAL_JSON_NAME].i18n} />
  </SheetStoreContextProvider>,
  document.getElementById('hydration-container'),
);
