import React from 'react';

import {RACE_STATES} from '@game/network/constants/serverCodes';

import {useI18n} from '@ui/i18n';
import {useIntervalResourceFetch} from '@pkg/basic-hooks';

import {Margin} from '@ui/basic-components/styled';
import {AsyncLockButton} from '@ui/basic-components';
import {GameButton} from '../../components/ui';

import TitledScreen from '../TitledScreen';
import PlayersScoreTable from './PlayersScoreTable';
import {LoadingOverlay} from '../../components/parts';

import useScreensWatcher from '../../hooks/useScreensWatcher';

const PlayersScore = ({gameBoard}) => {
  const t = useI18n('game.screens.score');
  const {
    result: players,
    loading,
  } = useIntervalResourceFetch(
    {
      fetchFn: ::gameBoard.client.getPlayersDescriptions,
    },
  );

  const {onGoToBoard} = useScreensWatcher(
    {
      currentScreen: RACE_STATES.ALL_FINISH,
      gameBoard,
    },
  );

  return (
    <TitledScreen
      header={
        t('header')
      }
    >
      {(
        loading
          ? <LoadingOverlay />
          : (
            <PlayersScoreTable
              players={players}
              currentPlayer={gameBoard.currentPlayer}
            />
          )
      )}

      <Margin
        top={3}
        style={{
          textAlign: 'right',
        }}
        block
      >
        <AsyncLockButton
          component={GameButton}
          type='red'
          style={{
            marginLeft: 'auto',
          }}
          onClick={onGoToBoard}
        >
          {t('next_button')}
        </AsyncLockButton>
      </Margin>
    </TitledScreen>
  );
};

PlayersScore.displayName = 'PlayersScore';

export default React.memo(PlayersScore);
