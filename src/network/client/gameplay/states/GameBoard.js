import {getIndexByID} from '@pkg/basic-helpers';
import {createIsometricScene} from '@pkg/isometric-renderer';
import {vec2} from '@pkg/gl-math';

import carKeyboardDriver, {GameKeyboardController} from '@game/logic/drivers/carKeyboardDriver';

import RoomMapNode from '../objects/RoomMapNode';
import RemoteRoomStateListener from '../RemoteRoomStateListener';

export default class GameBoard {
  constructor({client}) {
    this.client = client;
  }

  async setCanvas({
    canvas,
    aspectRatio,
  }) {
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

  async loadInitialRoomState(initialRoomState) {
    const {f} = this.scene;
    const {client} = this;

    this.roomMapNode = new RoomMapNode(
      {
        currentPlayer: client.info,
        f,
      },
    );

    await this.roomMapNode.loadInitialRoomState(initialRoomState);
    this.roomState = new RemoteRoomStateListener(
      {
        client,

        onSyncObject: this.onSyncObject,

        onLeavePlayer: (player) => {
          this.roomMapNode.removePlayerCar(player);
        },

        onJoinPlayer: (player, carObject) => {
          this.roomMapNode.appendObjects(
            {
              players: [player],
              objects: [carObject],
            },
          );
        },
      },
    );

    return this;
  }

  onSyncObject = (playerSyncInfo) => {
    const node = this.roomMapNode.refs.objects[playerSyncInfo.id];
    const {lastProcessedInput} = playerSyncInfo;

    const {currentPlayerCar} = this.roomMapNode;
    const currentPlayerSync = (
      currentPlayerCar.id === playerSyncInfo.id
    );

    if (!node) {
      console.warn(`Unknown sync object(id: ${playerSyncInfo.id})!`);
      return;
    }

    /** @see PlayerMapElement.binarySnapshotSerializer */
    const {body} = node;

    // floats
    Object.assign(
      body,
      {
        angle: playerSyncInfo.angle,
        corneringIntensity: playerSyncInfo.corneringIntensity,
        angularVelocity: playerSyncInfo.angularVelocity,
        steerAngle: playerSyncInfo.steerAngle,
        throttle: playerSyncInfo.throttle,
        pos: vec2(playerSyncInfo.pos[0], playerSyncInfo.pos[1]),
        velocity: vec2(playerSyncInfo.velocity[0], playerSyncInfo.velocity[1]),
      },
    );

    // try to reply all inputs after response
    if (lastProcessedInput !== -1 && currentPlayerSync) {
      const {predictedInputs} = this.keyboardController;
      const serverInputIndex = getIndexByID(lastProcessedInput, predictedInputs);

      if (serverInputIndex === -1)
        this.keyboardController.predictedInputs = [];
      else {
        if (serverInputIndex < predictedInputs.length) {
          let prevFrameId = predictedInputs[0].id;
          for (let i = serverInputIndex; i < predictedInputs.length; ++i) {
            const {bitset, frameId} = predictedInputs[i];
            if (prevFrameId !== frameId)
              body.update();

            carKeyboardDriver(bitset, body);
            prevFrameId = frameId;
          }

          body.update();
        }

        predictedInputs.splice(0, serverInputIndex);
      }
    }
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
  }

  stop() {
    this.roomState?.releaseListeners();
  }

  update(interpolate) {
    const {
      roomMapNode,
      client,
      keyboardController,
    } = this;

    const {currentPlayerCar: car} = roomMapNode;
    const input = keyboardController.storeInputs();
    if (input)
      carKeyboardDriver(input.bitset, car.body);

    if (interpolate.fixedStepUpdate) {
      const batchedInputs = keyboardController.flushBatch();
      if (batchedInputs.length)
        client.sendKeyMapState(batchedInputs);
    }

    roomMapNode.update(interpolate);
  }

  render(interpolate, mpMatrix) {
    const {roomMapNode} = this;

    roomMapNode.render(interpolate, mpMatrix);
  }
}
