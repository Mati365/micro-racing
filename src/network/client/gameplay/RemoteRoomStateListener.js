import * as R from 'ramda';

import {PLAYER_ACTIONS} from '@game/network/constants/serverCodes';

import PlayerInfo from '@game/server/Player/PlayerInfo';
import {PlayerMapElement} from '../../shared/map';

export default class RemoteRoomStateListener {
  boardListeners = {
    [PLAYER_ACTIONS.PLAYER_JOINED_TO_ROOM]: ({player, car}) => {
      this.onJoinPlayer(
        PlayerInfo.fromBSON(player),
        car,
      );
    },

    [PLAYER_ACTIONS.PLAYER_LEFT_ROOM]: ({player}) => {
      this.onLeavePlayer(player);
    },

    [PLAYER_ACTIONS.UPDATE_BOARD_OBJECTS]: ({buffer}) => {
      this.onUpdateBoardObjects(
        PlayerMapElement
          .binarySnapshotSerializer
          .loadPackedArrayFrame(R.identity, buffer, true),
      );
    },

    [PLAYER_ACTIONS.UPDATE_PLAYERS_RACE_STATE]: ({buffer}) => {
      this.onUpdatePlayersRaceState(
        PlayerMapElement
          .raceStateBinarySnapshotSerializer
          .loadPackedArrayFrame(R.identity, buffer, true),
      );
    },

    [PLAYER_ACTIONS.UPDATE_PLAYERS_ROOM_STATE]: (players) => {
      this.onUpdatePlayersRoomState(players);
    },

    [PLAYER_ACTIONS.UPDATE_RACE_STATE]: (data) => {
      this.onUpdateRaceState(data);
    },
  };

  constructor(
    {
      client,
      onLeavePlayer = R.F,
      onJoinPlayer = R.F,
      onUpdateBoardObjects = R.F,
      onUpdateRaceState = R.F,
      onUpdatePlayersRoomState = R.F,
      onUpdatePlayersRaceState = R.F,
    } = {},
  ) {
    this.onUpdateBoardObjects = onUpdateBoardObjects;
    this.onLeavePlayer = onLeavePlayer;
    this.onJoinPlayer = onJoinPlayer;

    this.onUpdateRaceState = onUpdateRaceState;
    this.onUpdatePlayersRaceState = onUpdatePlayersRaceState;
    this.onUpdatePlayersRoomState = onUpdatePlayersRoomState;

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
