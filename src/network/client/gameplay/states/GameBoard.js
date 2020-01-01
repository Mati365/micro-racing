import {PLAYER_TYPES} from '@game/network/constants/serverCodes';

import {
  getIndexByID,
  findByID,
  createLowLatencyObservable,
} from '@pkg/basic-helpers';

import {angleLerp, vec2} from '@pkg/gl-math';
import carKeyboardDriver from '@game/logic/drivers/carKeyboardDriver';

import RemoteRoomStateListener from '../RemoteRoomStateListener';
import RoomMapRefsStore from '../objects/RoomMapRefsStore';
import {
  RoomRaceState,
  RoomConfig,
} from '../../../shared/room';


export default class GameBoard {
  constructor(
    {
      refsStore,
      client,
      watchBoardRaceObjects = false,
    },
  ) {
    this.watchBoardRaceObjects = watchBoardRaceObjects;
    this.client = client;
    this.frameId = 1;

    this.observers = {
      roomMap: createLowLatencyObservable(),
      roomInfo: createLowLatencyObservable(),
      raceState: createLowLatencyObservable(),
      players: createLowLatencyObservable(),
      bannedPlayers: createLowLatencyObservable(),
    };

    this.roomInfo = {
      name: null,
      config: null,
      state: null,
      ownerID: null,
    };

    this.currentPlayer = client.info;
    this.refsStore = refsStore || new RoomMapRefsStore(null, this.currentPlayer);

    this.roomRemoteListener = null;
  }

  async forkOffscreen() {
    const {client} = this;
    const offscreenGameBoard = new GameBoard(
      {
        client,
      },
    );

    await offscreenGameBoard.loadInitialRoomState(
      await client.getRoomInitialState(),
    );

    return offscreenGameBoard;
  }

  isClientOP() {
    return this.client.info?.id === this.roomInfo?.ownerID;
  }

  updateCurrentPlayerRef() {
    this.currentPlayerRef = this.refsStore.refs.players[this.currentPlayer.id];
    if (this.currentPlayerRef)
      this.currentPlayerRef.player.current = true;
  }

  notifyPlayersChange(left, join) {
    const {players} = this.refsStore || {};
    const {currentPlayerRef} = this;

    this.observers.players.notify(
      {
        nodes: players,
        currentPlayerNode: currentPlayerRef,
        left,
        join,
      },
    );
  }

  mountRemoteListeners() {
    const {watchBoardRaceObjects, client, observers} = this;

    // broadcast new players list and map changes
    this.updateCurrentPlayerRef();
    this.notifyPlayersChange();

    observers.roomInfo.notify(this.roomInfo);
    observers.bannedPlayers.notify(this.banned);

    // mount listeners
    this.roomRemoteListener = new RemoteRoomStateListener(
      {
        client,

        onMapChanged: async (newMapLoadData) => {
          await this.refsStore.bootstrapRefs(
            {
              players: newMapLoadData.players,
              objects: newMapLoadData.map.objects,
            },
          );

          this.updateCurrentPlayerRef();
          observers.roomMap.notify(
            {
              roomInfo: this.roomInfo,
              refsStore: this.refsStore,
            },
          );
        },

        onUpdateRoomInfo: (roomInfo) => {
          Object.assign(
            this.roomInfo,
            {
              name: roomInfo.name,
              ownerID: roomInfo.owner.id,
              state: RoomRaceState.fromBSON(roomInfo.state),
              config: RoomConfig.fromBSON(roomInfo.config),
            },
          );

          observers.roomInfo.notify(this.roomInfo);
          observers.raceState.notify(this.roomInfo.state);
        },

        onUpdateBoardObjects: (players) => {
          if (watchBoardRaceObjects)
            players.forEach(this.onSyncObject);
        },

        onUpdatePlayersRoomState: ({players: playersInfos}) => {
          playersInfos.forEach(this.onSyncPlayerRoomInfo);
          this.notifyPlayersChange();
        },

        onUpdatePlayersRaceState: (playersStates) => {
          playersStates.forEach(this.onSyncPlayerRaceState);
          this.notifyPlayersChange();
        },

        onUpdateBannedList: (bannedPlayers) => {
          this.banned = bannedPlayers;
          observers.bannedPlayers.notify(bannedPlayers);
        },

        onJoinPlayer: async (player, carObject) => {
          await this.refsStore?.appendObjects(
            {
              players: [player],
              objects: (
                carObject
                  ? [carObject]
                  : []
              ),
            },
          );

          this.notifyPlayersChange(
            null,
            {
              refsStore: this.refsStore,
              player,
              carObject,
            },
          );
        },

        onLeavePlayer: (player) => {
          this.refsStore?.removePlayerCar(player);
          this.notifyPlayersChange(
            {
              refsStore: this.refsStore,
              player,
            },
            null,
          );
        },
      },
    );

    observers.roomMap.notify(
      {
        roomInfo: this.roomInfo,
        refsStore: this.refsStore,
      },
    );

    return this;
  }

  async loadInitialRoomState(initialRoomState) {
    this.banned = initialRoomState.banned || [];
    this.roomInfo = {
      name: initialRoomState.name,
      ownerID: initialRoomState.ownerID,
      state: initialRoomState.state,
      config: RoomConfig.fromBSON(initialRoomState.config),
    };

    await this.refsStore.bootstrapRefs(
      {
        players: initialRoomState.players,
        objects: initialRoomState.map.objects,
      },
    );

    // assign player info
    const updatedCurrentPlayerInfo = findByID(this.currentPlayer.id, initialRoomState.players);
    if (updatedCurrentPlayerInfo) {
      updatedCurrentPlayerInfo.current = true;
      Object.assign(
        this.currentPlayer,
        updatedCurrentPlayerInfo,
      );
    }

    return this.mountRemoteListeners();
  }

  onSyncPlayerRoomInfo = (playerInfo) => {
    const playerNode = this.refsStore.refs.players[playerInfo.id];
    if (!playerNode) {
      console.warn(`Unknown sync player room state(id: ${playerInfo.id})!`);
      return;
    }

    Object.assign(
      playerNode.player,
      {
        nick: playerInfo.nick,
      },
    );
  };

  onSyncPlayerRaceState = (playerRaceState) => {
    const playerNode = this.refsStore.refs.objects[playerRaceState.id];
    if (!playerNode) {
      console.warn(`Unknown sync player race state(id: ${playerNode.id})!`);
      return;
    }

    playerNode.player.kind = playerRaceState.kind;
    Object.assign(
      playerNode.player.racingState,
      {
        position: playerRaceState.position,
        currentLapTime: playerRaceState.currentLapTime,
        lap: playerRaceState.lap,
        state: playerRaceState.state,
      },
    );
  };

  onSyncObject = (playerSyncInfo) => {
    const node = this.refsStore.refs.objects[playerSyncInfo.id];
    const {lastProcessedInput} = playerSyncInfo;

    const {aiTraining} = this.roomInfo.config;
    const {physics} = this.refsStore;
    const {currentPlayerRef} = this;

    const currentPlayerSync = (
      currentPlayerRef.id === playerSyncInfo.id
    );

    if (!node) {
      console.warn(`Unknown sync object(id: ${playerSyncInfo.id})!`);
      return;
    }

    /** @see PlayerMapElement.binarySnapshotSerializer */
    const {body, player: {kind, racingState}} = node;
    if (!body)
      return;

    // floats
    const prevPos = body.pos;
    const prevAngle = body.angle;
    const prevVelocity = body.velocity;

    racingState.state = playerSyncInfo.stateBitset;
    Object.assign(
      body,
      {
        angle: playerSyncInfo.angle,
        steerAngle: playerSyncInfo.steerAngle,
        corneringIntensity: playerSyncInfo.corneringIntensity,
        angularVelocity: playerSyncInfo.angularVelocity,
        throttle: playerSyncInfo.throttle,
        pos: vec2(playerSyncInfo.pos[0], playerSyncInfo.pos[1]),
        velocity: vec2(playerSyncInfo.velocity[0], playerSyncInfo.velocity[1]),
      },
    );

    // try to reply all inputs after response
    const {predictedInputs} = this.keyboardController;
    const human = kind === PLAYER_TYPES.HUMAN;

    if (currentPlayerSync) {
      if (lastProcessedInput !== -1) {
        if (human
            && predictedInputs.length < 20
            && predictedInputs.length) {
          let serverInputIndex = getIndexByID(lastProcessedInput, predictedInputs);

          if (serverInputIndex !== -1 && serverInputIndex + 1 < predictedInputs.length) {
            serverInputIndex++;

            let prevFrameId = predictedInputs[serverInputIndex].frameId;

            for (let i = serverInputIndex; i < predictedInputs.length; ++i) {
              const {bitset, frameId, tempOnly} = predictedInputs[i];
              if (tempOnly)
                break;

              carKeyboardDriver(bitset, body);

              if (!tempOnly && (
                prevFrameId !== frameId
                    || i + 1 >= predictedInputs.length
                    || predictedInputs[i + 1].tempOnly)) {
                body.update();
                physics.updateObjectPhysics(body, aiTraining);
              }

              prevFrameId = frameId;
            }
          }

          predictedInputs.splice(0, serverInputIndex);
        } else {
          if (human)
            console.warn(`Skipping prediction! Predicted inputs: ${predictedInputs.length}!`);

          Object.assign(
            this.keyboardController,
            {
              predictedInputs: [],
              batch: [],
            },
          );
        }
      }
    }

    body.transparentToOthers = racingState.isFinish();

    if (!aiTraining) {
      if (!racingState.isFlashing()) {
        body.angle = angleLerp(prevAngle, body.angle, 0.1);
        body.pos = vec2.lerp(0.1, prevPos, body.pos);
        body.velocity = vec2.lerp(0.1, prevVelocity, body.velocity);
      }

      node.body.updateVerticesShapeCache();
      physics.updateObjectPhysics(body, aiTraining);
    }

    this.waitForSync = false;
  };

  update(interpolate) {
    const {
      waitForSync,
      refsStore,
      client,
      keyboardController,
    } = this;

    if (waitForSync)
      return;

    const {currentPlayerRef: car} = this;
    const input = (
      car.player.racingState.isFinish()
        ? false
        : keyboardController.storeInputs(this.frameId)
    );

    if (input)
      carKeyboardDriver(input.bitset, car.body);

    refsStore.update(interpolate);

    if (interpolate.fixedStepUpdate) {
      const batchedInputs = keyboardController.flushBatch();
      if (batchedInputs.length)
        client.sendKeyMapState(batchedInputs);

      this.frameId++;
    }
  }

  release() {
    this.roomRemoteListener?.releaseListeners();
  }
}
