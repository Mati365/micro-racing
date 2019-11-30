import {getIndexByID} from '@pkg/basic-helpers';
import {createIsometricScene} from '@pkg/isometric-renderer';
import {vec2, lerp} from '@pkg/gl-math';

import carKeyboardDriver, {GameKeyboardController} from '@game/logic/drivers/carKeyboardDriver';

import RoomMapNode from '../objects/RoomMapNode';
import RemoteRoomStateListener from '../RemoteRoomStateListener';

export default class GameBoard {
  constructor({client}) {
    this.client = client;
    this.frameId = 1;
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

    const {physics, currentPlayerCar} = this.roomMapNode;
    const currentPlayerSync = (
      currentPlayerCar.id === playerSyncInfo.id
    );

    if (!node) {
      console.warn(`Unknown sync object(id: ${playerSyncInfo.id})!`);
      return;
    }

    /** @see PlayerMapElement.binarySnapshotSerializer */
    const {body} = node;
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
        corneringIntensity: playerSyncInfo.corneringIntensity,
        angularVelocity: playerSyncInfo.angularVelocity,
        steerAngle: playerSyncInfo.steerAngle,
        throttle: playerSyncInfo.throttle,
        pos: vec2(playerSyncInfo.pos[0], playerSyncInfo.pos[1]),
        velocity: vec2(playerSyncInfo.velocity[0], playerSyncInfo.velocity[1]),
      },
    );

    // try to reply all inputs after response
    const {predictedInputs} = this.keyboardController;

    if (predictedInputs.length > 15) {
      console.warn(`Skipping prediction! Predicted inputs: ${predictedInputs.length}!`);
      this.keyboardController.predictedInputs = [];
    } else if (lastProcessedInput !== -1 && predictedInputs.length && currentPlayerSync) {
      let serverInputIndex = getIndexByID(lastProcessedInput, predictedInputs);

      if (serverInputIndex !== -1 && serverInputIndex + 1 < predictedInputs.length) {
        serverInputIndex++;

        let prevFrameId = predictedInputs[serverInputIndex].frameId;
        let skipLastUpdate = null;

        for (let i = serverInputIndex; i < predictedInputs.length; ++i) {
          const {bitset, frameId, tempOnly} = predictedInputs[i];

          if (skipLastUpdate === null)
            skipLastUpdate = false;

          carKeyboardDriver(bitset, body);

          if (!tempOnly && prevFrameId !== frameId) {
            body.update();
            physics.updateObjectPhysics(body);

            if (!skipLastUpdate && i + 1 >= predictedInputs.length)
              skipLastUpdate = true;
          }

          prevFrameId = frameId;
        }

        if (skipLastUpdate === false) {
          body.update();
          physics.updateObjectPhysics(body);
        }
      }

      predictedInputs.splice(0, serverInputIndex);
    }

    body.angle = lerp(prevAngle, body.angle, 0.05);
    body.pos = vec2.lerp(0.05, prevPos, body.pos);
    body.velocity = vec2.lerp(0.05, prevVelocity, body.velocity);

    node.body.updateVerticesShapeCache();

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
    this.roomState?.releaseListeners();
  }

  SERVER_FRAME_CACHE = {};

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
