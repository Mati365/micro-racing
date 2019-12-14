import {PLAYER_TYPES} from '@game/network/constants/serverCodes';

import {
  getIndexByID,
  createLowLatencyObservable,
} from '@pkg/basic-helpers';

import {createIsometricScene} from '@pkg/isometric-renderer';
import {lerp, vec2} from '@pkg/gl-math';

import carKeyboardDriver, {GameKeyboardController} from '@game/logic/drivers/carKeyboardDriver';

import RoomMapNode from '../objects/RoomMapNode';
import RemoteRoomStateListener from '../RemoteRoomStateListener';

export default class GameBoard {
  constructor(
    {
      client,
    },
  ) {
    this.client = client;
    this.frameId = 1;

    this.observers = {
      roomMap: createLowLatencyObservable(),
      raceState: createLowLatencyObservable(),
      players: createLowLatencyObservable(),
    };

    this.roomConfig = null;
    this.roomMapNode = null;
    this.roomRemoteListener = null;
  }

  async setCanvas(
    {
      canvas,
      aspectRatio,
    },
  ) {
    this.canvas = canvas;
    this.keyboardController = new GameKeyboardController(canvas);
    this.scene = createIsometricScene(
      {
        canvas,
        aspectRatio,
      },
    );

    return this;
  }

  notifyPlayersChange(left, join) {
    this.observers.players.notify(
      {
        nodes: this.roomMapNode.players,
        currentPlayerNode: this.roomMapNode.currentPlayerCar,
        left,
        join,
      },
    );
  }

  async loadInitialRoomState(initialRoomState) {
    const {f} = this.scene;
    const {client, observers} = this;

    this.roomConfig = initialRoomState.config;
    this.roomMapNode = new RoomMapNode(
      {
        currentPlayer: client.info,
        f,
      },
    );

    await this.roomMapNode.loadInitialRoomState(initialRoomState);

    this.notifyPlayersChange();
    this.roomRemoteListener = new RemoteRoomStateListener(
      {
        client,

        onUpdateBoardObjects: (players) => {
          players.forEach(this.onSyncObject);
        },

        onUpdatePlayersRaceState: (playersStates) => {
          playersStates.forEach(this.onSyncPlayerRaceState);
          this.notifyPlayersChange();
        },

        onUpdateRaceState: observers.raceState.notify,

        onJoinPlayer: async (player, carObject) => {
          await this.roomMapNode.appendObjects(
            {
              players: [player],
              objects: [carObject],
            },
          );

          this.notifyPlayersChange(
            null,
            {
              map: this.roomMapNode,
              player,
              carObject,
            },
          );
        },

        onLeavePlayer: (player) => {
          this.roomMapNode.removePlayerCar(player);
          this.notifyPlayersChange(
            {
              map: this.roomMapNode,
              player,
            },
            null,
          );
        },
      },
    );

    observers.roomMap.notify(
      {
        ...initialRoomState,
        map: this.roomMapNode,
      },
    );

    return this;
  }

  onSyncPlayerRaceState = (playerRaceState) => {
    const playerNode = this.roomMapNode.refs.objects[playerRaceState.id];
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
    const node = this.roomMapNode.refs.objects[playerSyncInfo.id];
    const {lastProcessedInput} = playerSyncInfo;

    const {physics, currentPlayerCar} = this.roomMapNode;
    const currentPlayerSync = (
      currentPlayerCar.id === playerSyncInfo.id
    );

    if (!node) {
      console.warn(`Unknown sync object(id: ${playerSyncInfo.id})!`);
      return;
    }

    /** @see PlayerMapElement.binarySnapshotSerializer */
    const {body, player: {kind}} = node;
    if (!body)
      return;

    // floats
    const prevPos = body.pos;
    const prevAngle = body.angle;
    const prevVelocity = body.velocity;

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

    if (lastProcessedInput !== -1) {
      if (human
          && predictedInputs.length < 20
          && predictedInputs.length && currentPlayerSync) {
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
              physics.updateObjectPhysics(body);
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

    if (currentPlayerSync && human) {
      body.angle = lerp(prevAngle, body.angle, 0.05);
      body.pos = vec2.lerp(0.05, prevPos, body.pos);
      body.velocity = vec2.lerp(0.05, prevVelocity, body.velocity);
    }

    node.body.updateVerticesShapeCache();
    physics.updateObjectPhysics(body);

    this.waitForSync = false;
  };

  start() {
    const {
      roomMapNode,
      scene,
    } = this;

    // start render loop
    // focus camera on player car
    roomMapNode.sceneBuffer.camera.target = this.roomMapNode.currentPlayerCar;
    scene.frame(
      {
        update: ::this.update,
        render: ::this.render,
      },
    );

    this.waitForSync = true;
  }

  stop() {
    this.roomRemoteListener?.releaseListeners();
  }

  update(interpolate) {
    const {
      waitForSync,
      roomMapNode,
      client,
      keyboardController,
    } = this;

    if (waitForSync)
      return;

    const {currentPlayerCar: car} = roomMapNode;
    const input = keyboardController.storeInputs(this.frameId);
    if (input)
      carKeyboardDriver(input.bitset, car.body);

    roomMapNode.update(interpolate);

    if (interpolate.fixedStepUpdate) {
      const batchedInputs = keyboardController.flushBatch();
      if (batchedInputs.length)
        client.sendKeyMapState(batchedInputs);

      this.frameId++;
    }
  }

  render(interpolate, mpMatrix) {
    const {roomMapNode} = this;

    roomMapNode.render(interpolate, mpMatrix);
  }
}
