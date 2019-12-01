import * as R from 'ramda';

import PLAYERS_COLORS from '@game/network/constants/playersColors';

/**
 * Generates color based on players list
 *
 * @returns {String}
 */
const genUniquePlayerColor = players => R.compose(
  arr => arr[0].templateColor,
  R.sortWith([
    R.ascend(R.prop('occurrences')),
  ]),
  R.map(
    (templateColor) => {
      const occurrences = R.reduce(
        (acc, player) => acc + +(player.info.racingState?.color === templateColor),
        0,
        players,
      );

      return {
        occurrences,
        templateColor,
      };
    },
  ),
)(PLAYERS_COLORS);

export default genUniquePlayerColor;
