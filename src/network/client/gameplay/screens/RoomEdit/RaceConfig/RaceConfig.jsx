import React from 'react';
import * as R from 'ramda';

import {useI18n} from '@ui/i18n';
import {useLowLatencyObservable} from '@pkg/basic-hooks';

import {
  AsyncLockButton,
  OptimisticForm,
} from '@ui/basic-components';

import {
  GameInlineFormGroup,
  GameRangeInput,
  GameButton,
  GameDivider,
} from '../../../components/ui';

const configResponseSelector = R.compose(
  ({laps, playersLimit, countdown}) => ({
    laps,
    playersLimit,
    countdown: countdown / 1000,
  }),
  R.propOr({}, 'config'),
);

const RaceConfigForm = ({op, l, optimisticValueLink, gameBoard}) => {
  const t = useI18n('game.screens.room_edit.race_config');

  useLowLatencyObservable(
    {
      observable: gameBoard.observers.roomInfo,
      watchOnly: true,
      onChange: (info) => {
        if (!info)
          return;

        const {config} = info;
        const {value} = l;
        if (config.laps !== value?.laps
            || config.playersLimit !== value?.playersLimit
            || config.countdown !== value?.countdown) {
          optimisticValueLink.setValue(
            {
              ...value,
              countdown: config.countdown / 1000,
              laps: config.laps,
              playersLimit: config.playersLimit,
            },
            null,
          );
        }
      },
    },
  );

  return (
    <>
      <GameInlineFormGroup
        label={
          t('players_count')
        }
        input={(
          <GameRangeInput
            min={1}
            max={6}
            disabled={!op}
            {...l.input('playersLimit')}
          />
        )}
      />

      <GameInlineFormGroup
        label={
          t('laps_count')
        }
        input={(
          <GameRangeInput
            min={1}
            max={8}
            disabled={!op}
            {...l.input('laps')}
          />
        )}
      />

      <GameInlineFormGroup
        label={
          t('countdown')
        }
        input={(
          <GameRangeInput
            min={0}
            max={30}
            disabled={!op}
            {...l.input('countdown')}
          />
        )}
      />

      {op && (
        <>
          <GameDivider />

          <AsyncLockButton
            component={GameButton}
            type='green'
            onClick={
              () => gameBoard.client.spawnBots()
            }
            expanded
          >
            {t('spawn_bots')}
          </AsyncLockButton>
        </>
      )}
    </>
  );
};

const RaceConfig = ({op, gameBoard}) => (
  <OptimisticForm
    selectorFn={configResponseSelector}
    asyncSubmitFn={
      async ({laps, playersLimit, countdown}) => gameBoard.client.setRoomInfo(
        {
          config: {
            laps,
            playersLimit,
            countdown: countdown * 1000,
          },
        },
      )
    }
  >
    {({l, optimisticValueLink}) => (
      <RaceConfigForm
        l={l}
        optimisticValueLink={optimisticValueLink}
        gameBoard={gameBoard}
        op={op}
      />
    )}
  </OptimisticForm>
);

RaceConfig.displayName = 'RaceConfig';

export default React.memo(RaceConfig);
