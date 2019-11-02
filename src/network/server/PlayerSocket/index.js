import consola from 'consola';
import chalk from 'chalk';

import logMethod, {logFunction} from '@pkg/basic-helpers/decorators/logMethod';

import {
  ERROR_CODES,
  PLAYER_ACTIONS,
  ACTION_FLAGS,
} from '@game/network/constants/serverCodes';

import createActionMessage, {
  getMessageMeta,
  getMessageContent,
} from '../../shared/utils/createActionMessage';

import ServerError from '../../shared/ServerError';
import PlayerInfo from './PlayerInfo';

/**
 * Socket API provider for player
 */
export default class PlayerSocket {
  constructor({
    ws,
    server,
    info = new PlayerInfo,
    onDisconnect,
  }) {
    this.server = server;
    this.ws = ws;
    this.info = info;
    this.onDisconnect = onDisconnect;

    this.mountMessagesHandler();
  }

  get id() {
    return this.info.id;
  }

  getBroadcastSocketJSON() {
    return this.info.getBroadcastSocketJSON();
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
        listener(
          cmdID,
          getMessageContent(message),
        );
      } catch (e) {
        const serializedError = (
          e?.toJSON
            ? e
            : new ServerError(ERROR_CODES.UNEXPECTED_ERROR)
        );

        this.sendActionResponse(
          cmdID,
          {
            error: serializedError.toJSON(),
          },
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
  @logFunction(
    (_, room) => {
      consola.info(`Player ${chalk.white.bold(this.info.nick)} joined to ${chalk.green.bold(room.name)}!`);
    },
    {
      afterExec: true,
    },
  )
  joinRoom(name) {
    const {server} = this;

    let room = server.findRoom(name);
    if (room)
      room.join(this);
    else {
      room = server.createRoom(
        {
          owner: this,
          name,
        },
      );
    }

    return room;
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
    const {server, info} = this;
    const {room} = info;

    room?.leave(this);
    server.rootRoom.leave(this);
  }

  /**
   * Mount action listeners
   */
  listeners = {
    [PLAYER_ACTIONS.SEND_KEYMAP]: (cmdID, {list}) => {
      this.info.inputs.push(...list);
    },

    [PLAYER_ACTIONS.PLAYER_INFO]: (cmdID) => {
      this.sendActionResponse(
        cmdID,
        this.getBroadcastSocketJSON(),
      );
    },

    [PLAYER_ACTIONS.JOIN_ROOM]: logFunction(
      (_, room) => {
        consola.info(`Player ${chalk.white.bold(this.info.nick)} joined to ${chalk.green.bold(room.name)}!`);
      },
      {
        afterExec: true,
      },
    )(
      (cmdID, {name}) => {
        const room = this.joinRoom(name);
        this.sendActionResponse(
          cmdID,
          room.getBroadcastSocketJSON(),
        );
        return room;
      },
    ),

    [PLAYER_ACTIONS.START_ROOM_RACE]: logFunction(
      () => {
        consola.info(`Player ${chalk.white.bold(this.info.nick)} started racing in ${chalk.green.bold(this.info.room.name)}!`);
      },
      {
        afterExec: true,
      },
    )(
      () => {
        const {room} = this.info;

        if (room?.owner !== this)
          throw new ServerError(ERROR_CODES.ACCESS_DENIED);

        this.info.keyMap = {};
        room.startRace();
      },
    ),
  }
}
