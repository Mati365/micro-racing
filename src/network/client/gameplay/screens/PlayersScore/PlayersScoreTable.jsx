import React from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';

import {ID_SCHEMA} from '@ui/schemas';
import {PLAYER_TYPES} from '@game/network/constants/serverCodes';
import {WHITE_DARKEN_5} from '@ui/colors';
import {PLAYERS_CARS_ICONS} from '@game/shared/sceneResources/icons';

import {useI18n} from '@ui/i18n';
import {formatLapTime} from '../../components/hud/PlayersTabs';

import {GameTable} from '../../components/ui';

const PlayersScoreTable = ({players, currentPlayer}) => {
  const t = useI18n('game.screens.score');

  return (
    <GameTable>
      <thead>
        <tr>
          <th style={{width: 50}}>
            {t('columns.position')}
          </th>
          <th>
            {t('columns.kind')}
          </th>
          <th style={{width: 200}}>
            {t('columns.nick')}
          </th>
          {players[0].racingState.lapsTimes.map(
            (_, lap) => (
              /* eslint-disable react/no-array-index-key */
              <th key={lap}>
                {t('columns.nth_lap_time', [lap + 1])}
              </th>
              /* eslint-enable react/no-array-index-key */
            ),
          )}
          <th>
            {t('columns.total_time')}
          </th>
        </tr>
      </thead>

      <tbody>
        {players.map(
          player => (
            <tr
              key={player.id}
              style={(
                player.id !== currentPlayer.id
                  ? {
                    color: WHITE_DARKEN_5,
                  }
                  : null
              )}
            >
              <td>
                {player.racingState.position}
              </td>
              <td>
                <img
                  src={PLAYERS_CARS_ICONS[player.kind]}
                  alt='Logo'
                  height={15}
                />
              </td>
              <td>
                {player.nick}
              </td>
              {player.racingState.lapsTimes.map(
                /* eslint-disable react/no-array-index-key */
                (lapTime, lap) => (
                  <td
                    key={lap}
                    style={{
                      color: WHITE_DARKEN_5,
                    }}
                  >
                    {formatLapTime(lapTime)}
                  </td>
                ),
                /* eslint-enable react/no-array-index-key */
              )}
              <td>
                {formatLapTime(player.racingState.time)}
              </td>
            </tr>
          ),
        )}
      </tbody>
    </GameTable>
  );
};

PlayersScoreTable.propTypes = {
  currentPlayer: PropTypes.shape(
    {
      id: ID_SCHEMA,
    },
  ),
  players: PropTypes.arrayOf(
    PropTypes.shape(
      {
        id: ID_SCHEMA,
        nick: PropTypes.string,
        kind: PropTypes.oneOf(R.values(PLAYER_TYPES)),
        racingState: PropTypes.shape(
          {
            color: PropTypes.string,
            position: PropTypes.number,
            time: PropTypes.number,
            lapsTimes: PropTypes.arrayOf(PropTypes.number),
          },
        ),
      },
    ),
  ),
};

PlayersScoreTable.defaultProps = {
  currentPlayer: {},
  players: [],
};

export default React.memo(PlayersScoreTable);
