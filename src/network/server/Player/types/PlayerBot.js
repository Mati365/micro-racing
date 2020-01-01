import {PLAYER_TYPES} from '@game/network/constants/serverCodes';

import CarNeuralAI from '@game/logic/drivers/neural';
import Player from '../Player';
import PlayerInfo from '../PlayerInfo';

export default class PlayerBot extends Player {
  constructor({room, info}) {
    super(
      {
        room,
        info: info || new PlayerInfo(
          {
            kind: PLAYER_TYPES.BOT,
            room,
          },
        ),
      },
    );
  }

  setCar(car) {
    const result = super.setCar(car);
    this.ai = new CarNeuralAI(
      {
        player: this,
      },
    );

    return result;
  }
}
