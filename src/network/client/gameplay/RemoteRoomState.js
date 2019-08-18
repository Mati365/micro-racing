import * as R from 'ramda';

import {PLAYER_ACTIONS} from '@game/network/constants/serverCodes';

import {
  findByID,
  removeByID,
} from '@pkg/basic-helpers';

export default class RemoteRoomState {
  boardListeners = {
    [PLAYER_ACTIONS.PLAYER_JOINED_TO_ROOM]: ({player, car}) => {
      this.joinPlayer(player, car);
    },

    [PLAYER_ACTIONS.PLAYER_LEFT_ROOM]: ({player}) => {
      this.leavePlayer(player);
    },
  };

  constructor({
    client,
    initialRoomState,
    onLeavePlayer,
    onJoinPlayer,
  } = {}) {
    const {ownerID, players, name} = initialRoomState;

    this.name = name;
    this.players = players;
    this.owner = findByID(ownerID, players);

    this.onLeavePlayer = onLeavePlayer;
    this.onJoinPlayer = onJoinPlayer;

    this.socketListeners = this.mountBroadcastSocketListeners(client);
  }

  mountBroadcastSocketListeners(client) {
    const {
      boardListeners,
    } = this;

    Object.assign(client.listeners, boardListeners);
    return () => {
      R.forEachObjIndexed(
        (listener, key) => {
          delete client.listeners[key];
        },
        boardListeners,
      );
    };
  }

  joinPlayer(player, carObject) {
    const {players} = this;

    players.push(player);
    this.onJoinPlayer?.(player, carObject);
  }

  leavePlayer(player) {
    this.players = removeByID(player.id, this.players);
    this.onLeavePlayer?.(player);
  }

  releaseListeners() {
    this.socketListeners();
  }
}
