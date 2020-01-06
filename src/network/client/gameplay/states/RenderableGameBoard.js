import {createIsometricScene} from '@pkg/isometric-renderer';
import {GameKeyboardController} from '@game/logic/drivers/carKeyboardDriver';

import RoomMapNode from '../objects/RoomMapNode';
import GameBoard from './GameBoard';

export default class RenderableGameBoard extends GameBoard {
  constructor(
    {
      client,
      aspectRatio,
      canvas,
    },
  ) {
    super(
      {
        refsStore: null,
        watchBoardRaceObjects: true,
        client,
      },
    );

    this.canvas = canvas;
    this.keyboardController = new GameKeyboardController(canvas);
    this.scene = createIsometricScene(
      {
        canvas,
        aspectRatio,
      },
    );

    this.f = this.scene.f;
    this.refsStore = new RoomMapNode(
      {
        currentPlayer: this.client.info,
        f: this.scene.f,
        board: this,
      },
    );
  }

  start() {
    const {
      refsStore,
      scene,
    } = this;

    // start render loop
    // focus camera on player car
    refsStore.sceneBuffer.camera.target = this.currentPlayerRef;
    this.frameRendererHandle = scene.frame(
      {
        update: ::this.update,
        render: ::refsStore.render,
      },
    );

    this.waitForSync = true;
  }

  release() {
    this.frameRendererHandle?.();
    this.refsStore?.release();
    this.keyboardController?.release();
    super.release();
  }
}
