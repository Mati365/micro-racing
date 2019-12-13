import {PLAYER_TYPES} from '@game/network/constants/serverCodes';

import robotIconUrl from '@game/res/img/icons/robot.png';
import meatIconUrl from '@game/res/img/icons/meat.png';
import zombieIconUrl from '@game/res/img/icons/zombie.png';

// eslint-disable-next-line import/prefer-default-export
export const PLAYERS_CARS_ICONS = {
  [PLAYER_TYPES.BOT]: robotIconUrl,
  [PLAYER_TYPES.HUMAN]: meatIconUrl,
  [PLAYER_TYPES.ZOMBIE]: zombieIconUrl,
};
