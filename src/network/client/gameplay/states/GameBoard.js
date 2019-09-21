import {createIsometricScene} from '@pkg/isometric-renderer';
import carKeyboardDriver from '@game/logic/physics/drivers/carKeyboardDriver';

import RoomMapNode from '../objects/RoomMapNode';
import RemoteRoomState from '../RemoteRoomState';

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

    canvas.addEventListener(
      'keydown',
      (e) => {
        this.keyMap[e.which] = true;
        this.client.sendKeyMapState(this.keyMap);
      },
      true,
    );

    canvas.addEventListener(
      'keyup',
      (e) => {
        delete this.keyMap[e.which];
        this.client.sendKeyMapState(this.keyMap);
      },
      true,
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
      keyMap,
    } = this;

    const {currentPlayerCar: car} = roomMapNode;
    carKeyboardDriver(keyMap, car.body);
    roomMapNode.update(interpolate);
  }

  render(interpolate, mpMatrix) {
    const {roomMapNode} = this;

    roomMapNode.render(interpolate, mpMatrix);
  }
}
