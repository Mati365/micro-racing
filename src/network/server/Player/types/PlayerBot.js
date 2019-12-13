import {PLAYER_TYPES} from '@game/network/constants/serverCodes';

import CarNeuralAI from '@game/logic/drivers/neural';
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

  assignRoom(config) {
    const {room, car} = config;
    this.ai = room && new CarNeuralAI(
      {
        car,
      },
    );

    return super.assignRoom(config);
  }
}
