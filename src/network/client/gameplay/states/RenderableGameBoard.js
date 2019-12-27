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
        client,
        refsStore: null,
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

  static fromOffscreenBoard(
    offscreenBoard,
    initParams,
  ) {
    const board = new RenderableGameBoard(
      {
        ...initParams,
        client: offscreenBoard.client,
      },
    );

    board.banned = [...offscreenBoard.banned];
    board.currentPlayer = {
      ...offscreenBoard.currentPlayer,
    };
    board.roomInfo = {
      ...offscreenBoard.roomInfo,
    };

    return {
      board,
      async bootstrap() {
        await board.refsStore.bootstrapRefs(
          offscreenBoard.refsStore.refs,
        );

        return board.mountRemoteListeners();
      },
    };
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
    super.release();
  }
}
