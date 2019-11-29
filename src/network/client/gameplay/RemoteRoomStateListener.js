import * as R from 'ramda';

import {PLAYER_ACTIONS} from '@game/network/constants/serverCodes';
import {PlayerMapElement} from '../../shared/map';

export default class RemoteRoomStateListener {
  boardListeners = {
    [PLAYER_ACTIONS.PLAYER_JOINED_TO_ROOM]: ({player, car}) => {
      this.onJoinPlayer(player, car);
    },

    [PLAYER_ACTIONS.PLAYER_LEFT_ROOM]: ({player}) => {
      this.onLeavePlayer(player);
    },

    [PLAYER_ACTIONS.UPDATE_RACE_STATE]: ({buffer}) => {
      const view = new DataView(buffer);
      const itemsCount = view.getInt8(0);

      let offset = 1;
      const serializer = PlayerMapElement.binarySnapshotSerializer;

      // this.c = (this.c || 0) + 1;
      // if (this.c > 10)
      //   return;

      for (let i = itemsCount - 1; i >= 0; --i) {
        this.onSyncObject(
          serializer.load(buffer, offset),
        );

        offset += serializer.size;
      }

      this.onSynchronized?.();
    },
  };

  constructor({
    client,
    onSynchronized,
    onSyncObject,
    onLeavePlayer,
    onJoinPlayer,
  } = {}) {
    this.onSyncObject = onSyncObject;
    this.onSynchronized = onSynchronized;
    this.onLeavePlayer = onLeavePlayer;
    this.onJoinPlayer = onJoinPlayer;

    this.socketListeners = this.mountSocketListeners(client);
  }

  mountSocketListeners(client) {
    const {boardListeners} = this;

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

  releaseListeners() {
    this.socketListeners();
  }
}
