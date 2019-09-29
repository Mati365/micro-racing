import {createIsometricScene} from '@pkg/isometric-renderer';

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

        onSynchronized: () => {
          this.keyboardController.flushPrediction();
        },

        onSyncObject: (playerSyncInfo) => {
          const node = this.roomMapNode.refs.objects[playerSyncInfo.id];

          if (this.roomMapNode.currentPlayerCar.id === playerSyncInfo.id)
            return;

          if (!node) {
            console.warn(`Unknown sync object(id: ${playerSyncInfo.id})!`);
            return;
          }

          /** @see PlayerMapElement.binarySnapshotSerializer */
          const {body} = node;

          // floats
          body.angle = playerSyncInfo.angle;
          body.corneringIntensity = playerSyncInfo.corneringIntensity;
          body.angularVelocity = playerSyncInfo.angularVelocity;
          body.steerAngle = playerSyncInfo.steerAngle;
          body.throttle = playerSyncInfo.throttle;

          // vectors
          body.pos.set(playerSyncInfo.pos);
          body.velocity.set(playerSyncInfo.velocity);
        },

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

    carKeyboardDriver(keyboardController.inputs, car.body);
    keyboardController.updateInputsQueue();

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
