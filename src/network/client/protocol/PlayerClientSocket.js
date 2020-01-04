import * as R from 'ramda';
import {interval} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

import {PLAYER_ACTIONS} from '@game/network/constants/serverCodes';
import BinarySocketRPCWrapper from './BinarySocketRPCWrapper';

export default class PlayerClientSocket {
  static defaultApiMethods = {
    sendKeyMapState: {
      action: PLAYER_ACTIONS.SEND_KEYMAP,
      serialize: R.objOf('list'),
      flags: {
        waitForResponse: false,
      },
    },

    fetchMapsList: {
      action: PLAYER_ACTIONS.GET_PREDEFINED_MAPS_LIST,
      flags: {
        waitForResponse: true,
      },
    },

    getChatMessages: {
      action: PLAYER_ACTIONS.GET_CHAT_MESSAGES,
      flags: {
        waitForResponse: true,
      },
    },

    sendChatMessage: {
      action: PLAYER_ACTIONS.SEND_CHAT_MESSAGE,
      flags: {
        waitForResponse: true,
      },
    },

    fetchRoomsList: {
      action: PLAYER_ACTIONS.GET_ROOMS_LIST,
      flags: {
        waitForResponse: true,
      },
    },

    getPlayersDescriptions: {
      action: PLAYER_ACTIONS.GET_PLAYERS_DESCRIPTIONS_LIST,
      flags: {
        waitForResponse: true,
        deserialize: R.prop('players'),
      },
    },

    getRoomInitialState: {
      action: PLAYER_ACTIONS.GET_ROOM_INITIAL_STATE,
      flags: {
        waitForResponse: true,
      },
    },

    spawnBots: {
      action: PLAYER_ACTIONS.SPAWN_BOTS,
      flags: {
        waitForResponse: true,
      },
    },

    leaveRoom: {
      action: PLAYER_ACTIONS.LEAVE_ROOM,
    },

    joinRoom: {
      action: PLAYER_ACTIONS.JOIN_ROOM,
      serialize: R.objOf('name'),
      flags: {
        waitForResponse: true,
      },
    },

    loadMap: {
      action: PLAYER_ACTIONS.LOAD_MAP,
      flags: {
        waitForResponse: true,
      },
    },

    unbanPlayer: {
      action: PLAYER_ACTIONS.UNBAN_PLAYER,
      flags: {
        waitForResponse: true,
      },
    },

    kickPlayer: {
      action: PLAYER_ACTIONS.KICK_PLAYER,
      flags: {
        waitForResponse: true,
      },
    },

    setRoomInfo: {
      action: PLAYER_ACTIONS.SET_ROOM_INFO,
      flags: {
        waitForResponse: true,
      },
    },

    setPlayerInfo: {
      action: PLAYER_ACTIONS.SET_PLAYER_INFO,
      flags: {
        waitForResponse: true,
      },
    },

    fetchPlayerInfo: {
      action: PLAYER_ACTIONS.GET_PLAYER_INFO,
      flags: {
        waitForResponse: true,
      },
    },

    stopRace: {
      action: PLAYER_ACTIONS.STOP_ROOM_RACE,
      flags: {
        waitForResponse: true,
      },
    },

    startRace: {
      action: PLAYER_ACTIONS.START_ROOM_RACE,
      flags: {
        waitForResponse: true,
      },
    },

    ping: {
      action: PLAYER_ACTIONS.PING,
      flags: {
        waitForResponse: true,
      },
    },
  };

  /**
   * Creates websocket connection and creates new PlayerClientSocket
   *
   * @returns {Promise}
   */
  static connect = (uri, clientParams) => new Promise((resolve, reject) => {
    const ws = new WebSocket(uri);
    ws.binaryType = 'arraybuffer';
    ws.onopen = () => {
      const clientSocket = new PlayerClientSocket;
      clientSocket.listeners = {
        [PLAYER_ACTIONS.CONNECTION_ERROR]: reject,
      };

      clientSocket
        .init(
          {
            ws,
            ...clientParams,
          },
        )
        .then(() => resolve(clientSocket))
        .catch(reject);
    };

    ws.onerror = reject;
  });

  /**
   * Load RPC wrappers, fetch initial player info
   *
   * @param {Object} config
   */
  async init(
    {
      ws,
      pingInterval = 500,
      playerInfo,
    } = {},
  ) {
    R.forEachObjIndexed(
      ({action, serialize = R.identity, flags}, methodName) => {
        this[methodName] = (...args) => this.rpc.sendBinaryRequest(
          action,
          serialize(...args),
          flags,
        );
      },
      PlayerClientSocket.defaultApiMethods,
    );

    this.ws = ws;
    this.listeners = this.listeners || {};
    this.rpc = new BinarySocketRPCWrapper(ws, this.listeners);
    this.info = await (
      playerInfo
        ? this.setPlayerInfo(playerInfo)
        : this.fetchPlayerInfo()
    );

    this.observers = {
      ping: interval(pingInterval)
        .pipe(
          mergeMap(async () => {
            const date = Date.now();
            await this.ping();

            return Date.now() - date;
          }),
        ),
    };
  }

  /**
   * Assign new player info
   *
   * @param {PlayerInfo} info
   */
  assignInfo(info) {
    this.info = info;
    return this;
  }
}
