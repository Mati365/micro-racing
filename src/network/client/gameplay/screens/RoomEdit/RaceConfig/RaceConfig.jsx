import React, {useEffect} from 'react';
import * as R from 'ramda';

import {useI18n} from '@ui/i18n';
import {useLowLatencyObservable} from '@pkg/basic-hooks';

import {OptimisticForm} from '@ui/basic-components';
import {
  GameInlineFormGroup,
  GameRangeInput,
} from '../../../components/ui';

const configResponseSelector = R.compose(
  R.pick(['laps', 'playersLimit']),
  R.propOr({}, 'config'),
);

const RaceConfigForm = ({l, optimisticValueLink, gameBoard}) => {
  const t = useI18n('game.screens.room_edit.race_config');

  const config = useLowLatencyObservable(
    {
      observable: gameBoard.observers.roomInfo,
    },
  )?.config;

  useEffect(
    () => {
      if (!config)
        return;

      const {value} = l;
      if (config.laps !== value?.laps || config.playersLimit !== value?.playersLimit) {
        optimisticValueLink.setValue(
          {
            ...value,
            laps: config.laps,
            playersLimit: config.playersLimit,
          },
          null,
        );
      }
    },
    [config],
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
            {...l.input('laps')}
          />
        )}
      />
    </>
  );
};

const RaceConfig = ({gameBoard}) => (
  <OptimisticForm
    selectorFn={configResponseSelector}
    asyncSubmitFn={
      async ({laps, playersLimit}) => gameBoard.client.setRoomInfo(
        {
          config: {
            laps,
            playersLimit,
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
      />
    )}
  </OptimisticForm>
);

RaceConfig.displayName = 'RaceConfig';

export default React.memo(RaceConfig);
