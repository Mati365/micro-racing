import uniqid from 'uniqid';
import * as R from 'ramda';

import {
  ROOM_SERVER_MESSAGES_TYPES,
  RACE_STATES,
  PLAYER_TYPES,
  ERROR_CODES,
  PLAYER_ACTIONS,
} from '@game/network/constants/serverCodes';

import {
  hasFlag,
  findByID,
  removeByID,
} from '@pkg/basic-helpers';

import TrackPath from '@game/logic/track/TrackPath';
import TrackEditor from '@game/screens/RoomEdit/MapChooseColumn/TrackEditorCanvas/TrackEditor';
import * as Layers from '@game/screens/RoomEdit/MapChooseColumn/TrackEditorCanvas/Layers';

import createActionMessage from '../shared/utils/createActionMessage';
import genUniquePlayerColor from './utils/genUniquePlayerColor';
import serializeBsonList from './utils/serializeBsonList';

import ServerError from '../shared/ServerError';
import PrerenderedLayerMap from './PrerenderedLayerMap';
import RoomRacing from './RoomRacing';
import RoomChat from './RoomChat';
import {RoomConfig} from '../shared/room';

import {PlayerBot} from './Player/types';
import {PlayerRacingState} from './Player/PlayerInfo';
import KickedPlayerInfo from './Player/KickedPlayerInfo';

/**
 * Contains list of players and race state
 *
 * @export
 * @class Room
 */
export default class Room {
  constructor(
    {
      id = uniqid(),
      server,
      owner,
      name,
      map,
      abstract, // its only virtual represenation of list of players
      kickedPlayers = [],
      players = [],
      config = new RoomConfig,
      onDestroy,
    },
  ) {
    this.id = id;
    this.server = server;
    this.config = config;
    this.name = name;
    this.owner = owner;
    this.abstract = abstract;
    this.kickedPlayers = kickedPlayers;
    this.chat = new RoomChat(
      {
        room: this,
      },
    );

    this.setMap(map, false);
    this.players = [];

    R.map(
      player => this.join(player, false),
      owner
        ? [...players, owner]
        : players,
    );

    this.onDestroy = onDestroy;

    // initial message
    if (!abstract && owner) {
      this.chat.post(
        {
          code: ROOM_SERVER_MESSAGES_TYPES.PLAYER_CREATED_ROOM,
          nick: owner.info.nick,
          color: owner.info.racingState.color,
        },
      );
    }
  }

  startRace() {
    if (this.abstract)
      return;

    this.resetRacingState(false);
    this.racing.start();
  }

  destroy() {
    if (this.abstract)
      return;

    this.onDestroy?.(this);
    this.racing?.stop();
  }

  /**
   * It is faster than sendBroadcastAction in real time events
   *
   * @param {Buffer} message
   */
  sendBinaryBroadcastMessage(message) {
    const {players} = this;

    for (let i = players.length - 1; i >= 0; --i) {
      const player = players[i];
      if (player.ws)
        player.ws.send(message);
    }
  }

  /**
   * Creates action message and broadcasts it to all players in room
   *
   * @param  {...any} params
   */
  sendBroadcastAction(...params) {
    this.sendBinaryBroadcastMessage(
      createActionMessage(...params),
    );
  }

  getKickedPlayersListBSON() {
    return serializeBsonList(this.kickedPlayers);
  }

  toMapBSON() {
    const {racing, players} = this;

    return {
      players: R.map(
        ({info}) => info.toBSON(),
        players,
      ),

      // field used to create of map instance on client
      map: racing.map.toBSON(),
    };
  }

  /**
   * Returns info about room used in some
   * for example rooms list, it must be compressed
   *
   * @returns
   * @memberof Room
   */
  toListBSON() {
    const {
      id, name, map, owner, config,
      racing, playersCount,
    } = this;

    return {
      id,
      name,
      playersCount,
      map: map?.toListBSON(),
      owner: R.pick(['id', 'nick'], owner.info),
      config: config.toBSON(),
      state: racing?.getRaceState().toBSON(),
    };
  }

  /**
   * Returns info about room with MAP
   *
   * @returns
   * @memberof Room
   */
  toBSON() {
    const {
      id, name, owner,
      config, racing,
    } = this;

    return {
      id,
      name,
      config: config.toBSON(),
      state: racing.getRaceState().toBSON(),
      ownerID: owner.info.id,
      banned: this.getKickedPlayersListBSON(),

      // map info
      ...this.toMapBSON(),
    };
  }

  get humans() {
    return R.filter(
      ({info}) => hasFlag(PLAYER_TYPES.HUMAN, info.kind),
      this.players,
    );
  }

  get bots() {
    return R.filter(
      ({info}) => hasFlag(PLAYER_TYPES.BOT, info.kind),
      this.players,
    );
  }

  get playersCount() {
    return this.players.length;
  }

  get isFull() {
    return this.playersCount >= this.config.playersLimit;
  }

  get isEmpty() {
    return !this.playersCount;
  }

  /**
   * Adds multiple bots to room and broadcast it
   *
   * @param {Number} count
   */
  spawnBots(count, broadcast = true) {
    if (!count || count < 0 || this.isFull)
      return false;

    R.times(
      () => {
        this.join(
          new PlayerBot(
            {
              room: this,
            },
          ),
          broadcast,
        );
      },
      count,
    );

    return true;
  }

  spawnRestPlayersBots() {
    this.spawnBots(
      this.config.playersLimit - this.playersCount,
    );
  }

  /**
   * Sends list of banned players
   */
  broadcastBannedPlayersRoomState() {
    const banned = this.getKickedPlayersListBSON();

    this.sendBroadcastAction(
      null,
      PLAYER_ACTIONS.BANNED_LIST_UPDATE,
      null,
      {
        banned,
      },
    );

    return banned;
  }

  /**
   * Sends playerInfo
   */
  broadcastPlayersRoomState() {
    this.sendBroadcastAction(
      null,
      PLAYER_ACTIONS.UPDATE_PLAYERS_ROOM_STATE,
      null,
      {
        players: this.players,
      },
    );
  }

  /**
   * Sends basic info about room
   */
  broadcastRoomInfo() {
    const data = this.toListBSON();

    this.sendBroadcastAction(
      null,
      PLAYER_ACTIONS.UPDATE_ROOM_INFO,
      null,
      data,
    );

    return data;
  }

  /**
   * Appends player to room players,
   * if owner is null(which should never happen) set it as owner
   *
   * @param {Player} player
   * @param {Boolean} broadcast
   */
  join(player, broadcast = true) {
    const {
      chat,
      abstract,
      players,
      racing,
    } = this;

    if (this.isFull)
      throw new ServerError(ERROR_CODES.ROOM_FULL);

    if (racing?.allowPlayerJoin === false)
      throw new ServerError(ERROR_CODES.RACING_ALREADY_ACTIVE);

    const {id} = player.info;
    if (findByID(id, players))
      throw new ServerError(ERROR_CODES.ALREADY_JOINED);

    if (this.isKickedPlayer(player))
      throw new ServerError(ERROR_CODES.ALREADY_KICKED);

    if (R.isNil(this.owner))
      this.owner = player;

    // append player to list and create car object
    this.players.push(player);

    // broadcast it to all players, exclude added
    if (!abstract) {
      player.assignRoom(
        {
          car: null,
          room: this,
          racingState: new PlayerRacingState(
            {
              color: genUniquePlayerColor(this.players),
            },
          ),
        },
      );

      if (broadcast) {
        this.sendBroadcastAction(
          null,
          PLAYER_ACTIONS.PLAYER_JOINED_TO_ROOM,
          null,
          {
            player: player.toBSON(),
          },
        );
      }

      chat.post(
        {
          code: ROOM_SERVER_MESSAGES_TYPES.PLAYER_JOIN,
          nick: player.info.nick,
          color: player.info.racingState.color,
        },
      );
    }
  }

  /**
   * Remove player from list
   *
   * @param {Player} player
   * @param {Boolean} broadcast
   */
  leave(player, broadcast = true) {
    const {abstract, owner, chat} = this;

    this.players = removeByID(player.id, this.players);
    if (!abstract)
      this.racing.map.removePlayerCar(player);

    const {racing, humans} = this;

    if (this.isEmpty || !humans.length)
      this.destroy();
    else if (!abstract) {
      if (racing?.state?.type === RACE_STATES.RACE)
        racing.checkRaceFinish();

      broadcast && chat.post(
        {
          code: ROOM_SERVER_MESSAGES_TYPES.PLAYER_LEFT,
          nick: player.info.nick,
          color: player.info.racingState.color,
        },
      );

      player.assignRoom(
        {
          room: null,
          car: null,
          racingState: null,
        },
      );

      if (broadcast) {
        if (player.id === owner?.id) {
          [this.owner] = humans;
          this.broadcastRoomInfo();
        }

        this.sendBroadcastAction(
          null,
          PLAYER_ACTIONS.PLAYER_LEFT_ROOM,
          null,
          {
            player: player.toBSON(),
          },
        );
      }
    }
  }

  /**
   * Check if player is
   *
   * @param {Player} player
   * @memberof Room
   */
  isKickedPlayer(player) {
    return R.any(
      kicked => kicked.isSimilarToPlayer(player),
      this.kickedPlayers,
    );
  }

  /**
   * Removes player from kicked list
   *
   * @param {ID} playerId
   * @memberof Room
   */
  unban(playerId) {
    this.kickedPlayers = removeByID(playerId, this.kickedPlayers);
    this.broadcastBannedPlayersRoomState();

    return true;
  }

  /**
   * Removes player from room
   *
   * @param {ID} playerId
   * @memberof Room
   */
  kick(playerId, ban = false) {
    const player = findByID(playerId, this.players);
    if (!player)
      return false;

    if (ban && player.info.kind !== PLAYER_TYPES.BOT) {
      this.kickedPlayers.push(
        KickedPlayerInfo.fromPlayer(player),
      );
    }

    this.chat.post(
      {
        code: ROOM_SERVER_MESSAGES_TYPES.PLAYER_KICK,
        nick: player.info.nick,
        color: player.info.racingState.color,
        ban,
      },
    );

    this.leave(player);
    this.broadcastBannedPlayersRoomState();

    player.ws?.send(
      createActionMessage(
        null,
        PLAYER_ACTIONS.YOU_ARE_KICKED,
        null,
        {
          message: null,
        },
      ),
    );

    return true;
  }

  /**
   * Name provided by user
   *
   * @param {Object} info
   * @returns
   * @memberof Room
   */
  safeAssignRoomInfo(info) {
    if (!info)
      return false;

    const {name, config} = info;
    if (config)
      this.config.safeAssignConfig(config);

    if (!R.isNil(name))
      this.name = name;

    if (this.playersCount > this.config.playersLimit) {
      const {owner, players} = this;
      const kickablePlayers = R.reverse(
        R.reject(
          R.propEq('id', owner.id),
          players,
        ),
      );

      for (let i = 0; i < this.playersCount - this.config.playersLimit; ++i)
        this.kick(kickablePlayers[i].id);
    }

    return this.broadcastRoomInfo();
  }

  /**
   * Sets already loaded map and broadcasts it
   *
   * @param {Object} map
   * @memberof Room
   */
  resetRacingState(broadcast) {
    if (this.abstract)
      return;

    const {recorder, aiTrainer} = this.racing || {};

    this.racing?.stop();
    this.racing = new RoomRacing(
      {
        room: this,
      },
    );

    if (aiTrainer && this.racing.aiTrainer)
      this.racing.aiTrainer.observers = aiTrainer.observers;

    if (recorder && this.racing.recorder)
      this.racing.recorder = recorder;

    R.forEach(
      (player) => {
        player
          .reset()
          .setCar(
            this.racing.map.appendPlayerCar(
              player,
              {
                ...this.racing.aiTrainer && {
                  position: 0,
                },
              },
            ),
          );
      },
      this.players || [],
    );

    if (broadcast) {
      this.sendBroadcastAction(
        null,
        PLAYER_ACTIONS.ROOM_MAP_CHANGED,
        null,
        this.toMapBSON(),
      );
    }
  }

  setMap(map, broadcast = true) {
    this.map = map;
    this.resetRacingState(broadcast);
  }

  /**
   * Loads map provided by user and broadcasts it to clients
   *
   * @param {Object} {points, name}
   * @memberof Room
   */
  loadProvidedMap({id, points}) {
    const {server} = this;
    let map = null;

    if (!R.isNil(id))
      map = findByID(id, server.maps);

    if (points) {
      map = PrerenderedLayerMap.prerender(
        new TrackEditor(
          {
            layers: {
              track: new Layers.TrackLayer(
                {
                  track: new TrackPath(points),
                },
              ),
            },
          },
        ).toLayerMap(),
      );
    }

    if (!map)
      throw new ServerError(ERROR_CODES.PROVIDED_EMPTY_MAP);

    this.setMap(map);
  }
}
