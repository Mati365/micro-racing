import * as R from 'ramda';

import {OBJECT_TYPES} from '@game/network/constants/serverCodes';

import {findByID} from '@pkg/basic-helpers';
import PlayerInfo from '@game/server/Player/PlayerInfo';

export const findRoadElement = R.filter(
  ({type}) => type === OBJECT_TYPES.ROAD,
);

export const createOffscreenRefs = ({players, objects}) => {
  const playersObject = R.reduce(
    (acc, player) => {
      if (player) {
        acc[player.id] = {
          racingState: {},
          player,
        };
      }

      return acc;
    },
    {},
    players,
  );

  return {
    objects: R.when(
      R.is(Array),
      R.reduce(
        (acc, obj) => {
          const {playerID} = obj.params;
          if (playerID)
            obj.player = playersObject[playerID];

          acc[obj.id] = obj;
          return acc;
        },
        {},
      ),
      objects,
    ),
    players: playersObject,
  };
};

export const createMapRefs = () => ({
  players: {},
  objects: [],
});

/**
 * Stores information about map objects
 *
 * @see
 *  Used on server!
 *
 * @export
 * @class RoomMapRefsStore
 */
export default class RoomMapRefsStore {
  constructor(refs, currentPlayer) {
    this.refs = refs || createMapRefs();
    this.currentPlayer = currentPlayer;
  }

  get players() {
    return this.refs.players;
  }

  appendObjects({players, objects}) {
    this.appendRefsStore(
      {
        refs: createOffscreenRefs(
          {
            players,
            objects,
          },
        ),
      },
    );
  }

  appendRefsStore(refsStore) {
    this.refs = {
      objects: (
        R.is(Array, this.refs.objects)
          ? [
            ...this.refs.objects,
            ...refsStore.refs.objects,
          ]
          : {
            ...this.refs.objects,
            ...refsStore.refs.objects,
          }
      ),

      players: {
        ...this.refs.players,
        ...refsStore.refs.players,
      },
    };

    return this;
  }

  removePlayerCar(player) {
    const {refs} = this;
    const carNode = refs.players[player.id]?.player;

    // array is not loaded
    if (R.is(Array, refs.objects)) {
      refs.objects = R.filter(
        ({params}) => params.playerID !== player.id,
        refs.objects,
      );
    } else
      delete refs.objects[carNode.id];

    // delete hash players list
    delete refs.players[player.id];
  }

  bootstrapRefs({players, objects}) {
    this.release();

    const parsedPlayers = R.map(PlayerInfo.fromBSON, players);
    findByID(this.currentPlayer.id, parsedPlayers).current = true;

    this.roadElement = findRoadElement(objects);
    this.refs = createOffscreenRefs(
      {
        players: parsedPlayers,
        objects,
      },
    );

    return this;
  }

  release() {
    R.forEachObjIndexed(
      obj => obj.release?.(),
      this.refs?.objects || {},
    );

    this.refs = createMapRefs();
  }
}
