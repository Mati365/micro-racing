import {PLAYER_TYPES} from '@game/network/constants/serverCodes';

import Player from '../Player';
import PlayerInfo from '../PlayerInfo';

export default class PlayerBot extends Player {
  constructor({server, room, info}) {
    super(
      {
        server,
        info: info || new PlayerInfo(
          {
            kind: PLAYER_TYPES.BOT,
            room,
          },
        ),
      },
    );
  }
}
