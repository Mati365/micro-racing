import {toRadians} from '@pkg/gl-math';
import {createIsometricScene} from '@pkg/isometric-renderer';

import RoomMapNode from '../objects/RoomMapNode';
import RemoteRoomState from '../RemoteRoomState';

const ROTATE_CAR_SPEED = toRadians(1);

export default class GameBoard {
  keyMap = {};

  constructor({client}) {
    this.client = client;
  }

  async setCanvas({
    canvas,
    aspectRatio,
  }) {
    this.canvas = canvas;
    this.scene = createIsometricScene(
      {
        canvas,
        aspectRatio,
      },
    );

    canvas.addEventListener('keydown', (e) => { this.keyMap[e.which] = true; }, true);
    canvas.addEventListener('keyup', (e) => { this.keyMap[e.which] = false; }, true);
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
    this.roomState = new RemoteRoomState(
      {
        client,
        initialRoomState,

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
      (delta, mpMatrix) => {
        this.update(delta);
        this.render(delta, mpMatrix);
      },
    );
  }

  stop() {
    this.roomState?.releaseListeners();
  }

  update(delta) {
    const {
      roomMapNode,
      keyMap,
    } = this;

    const {currentPlayerCar: car} = roomMapNode;
    if (car) {
      // left
      if (keyMap[37])
        car.body.turn(-ROTATE_CAR_SPEED * delta);

      // right
      else if (keyMap[39])
        car.body.turn(ROTATE_CAR_SPEED * delta);

      // w
      if (keyMap[87])
        car.body.speedUp(4 * delta);

      // s
      if (keyMap[83])
        car.body.speedUp(-4 * delta);
    }

    roomMapNode.update(delta);
  }

  render(delta, mpMatrix) {
    const {roomMapNode} = this;

    roomMapNode.render(delta, mpMatrix);
  }
}
