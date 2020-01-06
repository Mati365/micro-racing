import consola from 'consola';
import chalk from 'chalk';
import * as R from 'ramda';

import {
  ROOM_SERVER_MESSAGES_TYPES,
  PLAYER_TYPES,
  ERROR_CODES,
  PLAYER_ACTIONS,
  ACTION_FLAGS,
  CAR_TYPES,
} from '@game/network/constants/serverCodes';

import {PLAYER_TYPES_BODY_CONFIG} from '@game/network/shared/map/PlayerMapElement';

import {vec2} from '@pkg/gl-math';
import logMethod, {logFunction} from '@pkg/basic-helpers/decorators/logMethod';
import {getRandomObjValue} from '@pkg/basic-helpers';

import CarNeuralAI from '@game/logic/drivers/neural';

import serializeBsonList from '../../utils/serializeBsonList';
import serializeServerError from '../../../shared/utils/serializeServerError';

import createActionMessage, {
  getMessageMeta,
  getMessageContent,
} from '../../../shared/utils/createActionMessage';

import ServerError from '../../../shared/ServerError';
import PlayerInfo from '../PlayerInfo';
import Player from '../Player';

const requireRoomWrapper = fn => (function requireRoomWrapperFn(cmdID, ...args) {
  const {room} = this.info;
  if (!room)
    throw new ServerError(ERROR_CODES.ACCESS_DENIED);

  return fn.call(this, cmdID, room, ...args);
});

const requireRoomOwnerWrapper = fn => requireRoomWrapper(
  function requireOwnerWrapperFn(cmdID, room, ...args) {
    if (room?.owner !== this)
      throw new ServerError(ERROR_CODES.ACCESS_DENIED);

    return fn(cmdID, room, ...args);
  },
);

/**
 * Socket API provider for player
 */
export default class PlayerSocket extends Player {
  constructor(
    {
      ip,
      ws,
      server,
      info = new PlayerInfo(
        {
          kind: PLAYER_TYPES.HUMAN,
        },
      ),
      onDisconnect,
    },
  ) {
    super(
      {
        server,
        info,
      },
    );

    this.ws = ws;
    this.ip = ip;
    this.onDisconnect = onDisconnect;

    this.mountMessagesHandler();
  }

  reset() {
    this.transformToHuman();

    return super.reset();
  }

  assignRoom(config) {
    super.assignRoom(config);
    if (!this.ai && this.info.kind === PLAYER_TYPES.ZOMBIE)
      this.transformToZombie();
  }

  transformToZombie() {
    const {info} = this;

    if (!this.ai || info.kind !== PLAYER_TYPES.ZOMBIE) {
      info.kind = PLAYER_TYPES.ZOMBIE;
      info.inputs = [];

      Object.assign(
        info.car.body,
        {
          steerAngle: 0,
          ...PLAYER_TYPES_BODY_CONFIG[PLAYER_TYPES.BOT],
        },
      );

      this.ai = new CarNeuralAI(
        {
          player: this,
        },
      );
    }

    return this;
  }

  transformToHuman() {
    const {info} = this;

    if (info.kind !== PLAYER_TYPES.HUMAN) {
      info.kind = PLAYER_TYPES.HUMAN;

      if (info.car) {
        Object.assign(
          info.car.body,
          {
            steerAngle: 0,
            ...PLAYER_TYPES_BODY_CONFIG[PLAYER_TYPES.HUMAN],
          },
        );
      }

      this.ai = null;
    }

    return this;
  }

  @logMethod(
    ({info}) => {
      consola.info(`Welcome player ${chalk.white.bold(info.nick)}!`);
    },
    {
      afterExec: true,
    },
  )
  mountMessagesHandler() {
    const {
      ws,
      server,
      listeners,
    } = this;

    server.rootRoom.join(this);

    ws.on('message', (message) => {
      const {cmdID, action} = getMessageMeta(message);
      const listener = listeners[action];
      if (!listener)
        return;

      try {
        listener.call(
          this,
          cmdID,
          getMessageContent(message),
        );
      } catch (e) {
        this.sendActionResponse(
          cmdID,
          serializeServerError(e),
        );

        consola.error(e);
      }
    });

    ws.on('close', () => {
      this.leave();
      this.onDisconnect?.(this);
    });
  }

  /**
   * Sends response callback to client
   *
   * @param {Int} cmdID Action identifier on client
   * @param {Object|Array} data
   */
  sendActionResponse(cmdID, data) {
    const {ws} = this;

    ws.send(
      createActionMessage(
        cmdID,
        null,
        ACTION_FLAGS.RESPONSE,
        data,
      ),
    );
  }

  /**
   * Append player to both rooms
   */
  @logMethod(
    ({info}, room) => {
      consola.info(`Player ${chalk.white.bold(info.nick)} joined to ${chalk.red.bold(room.name)}!`);
    },
    {
      afterExec: true,
    },
  )
  joinRoom(id) {
    const {server, info} = this;

    let room = server.findRoom(id);
    if (room)
      room.join(this);
    else {
      room = server.createRoom(
        {
          owner: this,
          name: `${info.nick}'s room`,
        },
      );

      room.spawnRestPlayersBots();
    }

    return room;
  }

  @logMethod(
    ({info}) => {
      consola.info(`Player ${chalk.white.bold(info.nick)} left ${chalk.red.bold(info.room?.name || 'rootChannel')}!`);
    },
  )
  leaveRoom() {
    const {info} = this;

    info.room?.leave(this);
    info.room = null;
  }


  /**
   * Remove user from root players list and room
   */
  @logMethod(
    ({info}) => {
      consola.info(`Bye bye player ${chalk.white.bold(info.nick)}!`);
    },
    {
      afterExec: true,
    },
  )
  leave() {
    this.leaveRoom();
    this.server.rootRoom.leave(this);
  }

  /**
   * Mount action listeners
   */
  listeners = {
    [PLAYER_ACTIONS.SEND_KEYMAP]: (cmdID, {list}) => {
      const {info} = this;

      if (list[0].bitset && info.kind !== PLAYER_TYPES.HUMAN)
        this.transformToHuman();

      info.inputs.push(...list);
    },

    [PLAYER_ACTIONS.PING]: (cmdID) => {
      this.sendActionResponse(
        cmdID,
        {
          time: Date.now(),
        },
      );
    },

    [PLAYER_ACTIONS.UNBAN_PLAYER]: requireRoomOwnerWrapper((cmdID, room, {id}) => {
      this.sendActionResponse(
        cmdID,
        {
          result: room.unban(id),
        },
      );
    }),

    [PLAYER_ACTIONS.KICK_PLAYER]: requireRoomOwnerWrapper((cmdID, room, {id, ban}) => {
      this.sendActionResponse(
        cmdID,
        {
          result: room.kick(id, ban),
        },
      );
    }),

    [PLAYER_ACTIONS.GET_ROOM_INITIAL_STATE]: requireRoomWrapper((cmdID, room) => {
      this.sendActionResponse(
        cmdID,
        room.toBSON(),
      );
    }),

    [PLAYER_ACTIONS.SET_ROOM_INFO]: requireRoomOwnerWrapper((cmdID, room, roomInfo) => {
      this.sendActionResponse(
        cmdID,
        room.safeAssignRoomInfo(roomInfo),
      );
    }),

    [PLAYER_ACTIONS.SET_PLAYER_INFO]: (cmdID, {nick, carType}) => {
      const {
        room,
        nick: prevNick,
      } = this.info;

      const newNick = R.slice(0, 20, nick) || prevNick;
      if (newNick !== prevNick)
        consola.info(`Player ${chalk.white.bold(prevNick)} renamed to ${chalk.green.bold(newNick)}!`);

      Object.assign(
        this.info,
        {
          nick: newNick,
          carType: (
            R.contains(carType, R.values(CAR_TYPES))
              ? carType
              : getRandomObjValue(CAR_TYPES)
          ),
        },
      );

      if (room) {
        room.broadcastPlayersRoomState();
        room.chat.post(
          {
            code: ROOM_SERVER_MESSAGES_TYPES.PLAYER_RENAME,
            color: this.info.racingState?.color,
            prevNick,
            nick,
          },
        );
      }

      this.sendActionResponse(
        cmdID,
        this.toBSON(),
      );
    },

    [PLAYER_ACTIONS.GET_PLAYER_INFO]: (cmdID) => {
      this.sendActionResponse(
        cmdID,
        this.toBSON(),
      );
    },

    [PLAYER_ACTIONS.GET_PREDEFINED_MAPS_LIST]: (cmdID) => {
      this.sendActionResponse(
        cmdID,
        {
          list: R.map(
            map => map.toListBSON(),
            this.server.maps,
          ),
        },
      );
    },

    [PLAYER_ACTIONS.GET_ROOMS_LIST]: (cmdID) => {
      this.sendActionResponse(
        cmdID,
        {
          list: R.map(
            room => room.toListBSON(),
            this.server.rooms,
          ),
        },
      );
    },

    [PLAYER_ACTIONS.LEAVE_ROOM]: requireRoomWrapper(() => {
      this.leaveRoom();
    }),

    [PLAYER_ACTIONS.JOIN_ROOM]: (cmdID, {name}) => {
      const room = this.joinRoom(name);
      this.sendActionResponse(
        cmdID,
        room.toBSON(),
      );
      return room;
    },

    [PLAYER_ACTIONS.LOAD_MAP]: R.compose(
      requireRoomOwnerWrapper,
      logFunction(
        () => {
          consola.info(`Player ${chalk.white.bold(this.info.nick)} changed map!`);
        },
        {
          afterExec: true,
        },
      ),
    )(
      (cmdID, room, {id, points}) => {
        if ((!id && !points) || (points && points.length < 4 && vec2.sumDistances(points) > 5000)) {
          this.sendActionResponse(
            cmdID,
            {
              result: false,
            },
          );
          return;
        }

        room.loadProvidedMap(
          {
            id,
            points,
          },
        );
        this.sendActionResponse(
          cmdID,
          {
            result: true,
          },
        );
      },
    ),

    [PLAYER_ACTIONS.STOP_ROOM_RACE]: R.compose(
      requireRoomOwnerWrapper,
      logFunction(
        () => {
          consola.info(`Player ${chalk.white.bold(this.info.nick)} stopped racing in ${chalk.red.bold(this.info.room.name)}!`);
        },
        {
          afterExec: true,
        },
      ),
    )(
      (cmdID, room) => {
        room.racing?.stop();
        this.sendActionResponse(
          cmdID,
          {
            result: true,
          },
        );
      },
    ),

    [PLAYER_ACTIONS.START_ROOM_RACE]: R.compose(
      requireRoomOwnerWrapper,
      logFunction(
        () => {
          consola.info(`Player ${chalk.white.bold(this.info.nick)} started racing in ${chalk.red.bold(this.info.room.name)}!`);
        },
        {
          afterExec: true,
        },
      ),
    )(
      (cmdID, room) => {
        room.players.forEach(
          (player) => {
            player.info.inputs = [];
          },
        );

        room.startRace();

        this.sendActionResponse(
          cmdID,
          {
            result: true,
          },
        );
      },
    ),


    [PLAYER_ACTIONS.GET_CHAT_MESSAGES]: requireRoomWrapper((cmdID, room) => {
      this.sendActionResponse(
        cmdID,
        room.chat.toListBSON(),
      );
    }),

    [PLAYER_ACTIONS.SEND_CHAT_MESSAGE]: requireRoomWrapper((cmdID, room, {message}) => {
      room.chat.post(message, this);

      this.sendActionResponse(
        cmdID,
        {
          result: true,
        },
      );
    }),

    [PLAYER_ACTIONS.GET_PLAYERS_DESCRIPTIONS_LIST]: requireRoomWrapper((cmdID, room) => {
      const players = serializeBsonList(room.players);

      this.sendActionResponse(
        cmdID,
        {
          players: R.compose(
            R.addIndex(R.map)((item, index) => ({
              ...item,
              racingState: {
                ...item.racingState,
                position: index + 1,
              },
            })),
            R.sortBy(
              player => player.racingState.time,
            ),
          )(players),
        },
      );
    }),

    [PLAYER_ACTIONS.SPAWN_BOTS]: requireRoomOwnerWrapper((cmdID, room) => {
      room.spawnRestPlayersBots();

      this.sendActionResponse(
        cmdID,
        {
          result: true,
        },
      );
    }),
  }
}
