import React from 'react';
import {Route, MemoryRouter} from 'react-router-dom';

import {useI18n} from '@ui/i18n';
import useClientSocket from './hooks/useClientSocket';

import NickChooseScreen from './NickChoose';
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
    client,
  } = useClientSocket();

  const onNickSet = (nick) => {
    console.log(nick);
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
                  () => <NickChooseScreen onNickSet={onNickSet} />
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
