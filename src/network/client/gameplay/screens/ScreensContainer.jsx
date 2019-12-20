import React from 'react';
import {Route, MemoryRouter} from 'react-router-dom';

import {useI18n} from '@ui/i18n';
import useClientSocket from './hooks/useClientSocket';

import ConfigChooseScreen from './ConfigChoose';
import {GameCanvasHolder} from '../components';
import {TitledOverlay} from '../components/parts';

const ConnectingScreen = React.memo(() => {
  const t = useI18n();

  return (
    <TitledOverlay>
      {t('game.screens.loading.header')}
    </TitledOverlay>
  );
});

const ScreensContainer = () => {
  const {
    connecting,
    // client,
  } = useClientSocket();

  const onConfigSet = (config) => {
    console.log(config);
  };

  return (
    <GameCanvasHolder>
      {(
        connecting
          ? <ConnectingScreen />
          : (
            <MemoryRouter>
              <Route
                path='/'
                render={
                  () => <ConfigChooseScreen onConfigSet={onConfigSet} />
                }
              />
            </MemoryRouter>
          )
      )}
    </GameCanvasHolder>
  );
};

ScreensContainer.displayName = 'ScreensContainer';

export default ScreensContainer;
