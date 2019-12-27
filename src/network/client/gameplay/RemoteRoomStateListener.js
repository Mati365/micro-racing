import * as R from 'ramda';

import {PLAYER_ACTIONS} from '@game/network/constants/serverCodes';

import PlayerInfo from '@game/server/Player/PlayerInfo';
import {PlayerMapElement} from '../../shared/map';

export default class RemoteRoomStateListener {
  boardListeners = {
    [PLAYER_ACTIONS.ROOM_MAP_CHANGED]: (mapLoadData) => {
      this.onMapChanged(mapLoadData);
    },

    [PLAYER_ACTIONS.BANNED_LIST_UPDATE]: ({banned}) => {
      this.onUpdateBannedList(banned);
    },

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

    [PLAYER_ACTIONS.UPDATE_ROOM_INFO]: (data) => {
      this.onUpdateRoomInfo(data);
    },
  };

  constructor(
    {
      client,
      onMapChanged = R.F,
      onUpdateBannedList = R.F,
      onLeavePlayer = R.F,
      onJoinPlayer = R.F,
      onUpdateBoardObjects = R.F,
      onUpdateRoomInfo = R.F,
      onUpdatePlayersRoomState = R.F,
      onUpdatePlayersRaceState = R.F,
    } = {},
  ) {
    this.onMapChanged = onMapChanged;
    this.onUpdateBannedList = onUpdateBannedList;
    this.onUpdateBoardObjects = onUpdateBoardObjects;
    this.onLeavePlayer = onLeavePlayer;
    this.onJoinPlayer = onJoinPlayer;

    this.onUpdateRoomInfo = onUpdateRoomInfo;
    this.onUpdatePlayersRaceState = onUpdatePlayersRaceState;
    this.onUpdatePlayersRoomState = onUpdatePlayersRoomState;

    this.socketListeners = this.mountSocketListeners(client);
  }

  mountSocketListeners(client) {
    const {boardListeners} = this;
    const unmounters = R.mapObjIndexed(
      (listener, type) => client.rpc.chainListener(type, listener),
      boardListeners,
    );

    return () => R.forEachObjIndexed(
      R.applyTo(true),
      unmounters,
    );
  }

  releaseListeners() {
    this.socketListeners();
  }
}
