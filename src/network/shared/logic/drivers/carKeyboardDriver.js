import INPUT_FLAGS, {ACTION_KEYCODES_MAP} from '@game/network/constants/inputFlags';

import {toRadians} from '@pkg/gl-math';
import {
  setBit,
  getBit,
} from '@pkg/basic-helpers';

import PlayerInput from '@game/network/shared/PlayerInput';

const ROTATE_CAR_SPEED = toRadians(1);

const carKeyboardDriver = (input, carBody) => {
  if (!carBody)
    return;

  // left
  if (getBit(INPUT_FLAGS.TURN_LEFT, input))
    carBody.turn(-ROTATE_CAR_SPEED);

  // right
  else if (getBit(INPUT_FLAGS.TURN_RIGHT, input))
    carBody.turn(ROTATE_CAR_SPEED);

  // w
  if (getBit(INPUT_FLAGS.THROTTLE, input))
    carBody.speedUp(4);

  // s
  if (getBit(INPUT_FLAGS.BRAKE, input))
    carBody.speedUp(-4);
};

/**
 * @see
 * Class maps keyboard inputs into flags that
 * is used by carKeyboardDriver method later in
 * server or client updater code
 */
export class GameKeyboardController {
  inputs = 0b0;

  inputsCounter = 0;

  frameId = 0

  predictedInputs = [];

  batch = [];


  constructor(canvas) {
    this.canvas = this.attachCanvasListeners(canvas);
  }

  attachCanvasListeners(canvas) {
    canvas.addEventListener(
      'keydown',
      (e) => {
        this.inputs = setBit(
          ACTION_KEYCODES_MAP[e.which],
          1,
          this.inputs,
        );
      },
      true,
    );

    canvas.addEventListener(
      'keyup',
      (e) => {
        this.inputs = setBit(
          ACTION_KEYCODES_MAP[e.which],
          0,
          this.inputs,
        );
      },
      true,
    );

    return canvas;
  }

  storeInputs() {
    const {predictedInputs, batch} = this;

    if (this.inputs) {
      const input = new PlayerInput(
        (this.inputsCounter++) % 0xFFFF, // due to binary serializer
        this.frameId,
        this.inputs,
      );

      batch.push(input);
      predictedInputs.push(input);

      return input;
    }

    return null;
  }

  /**
   * @see
   *  Send current batch to server!
   */
  flushBatch() {
    const list = this.batch;

    this.batch = [];
    this.frameId = (this.frameId || 0) + 1;

    return list;
  }

  flushPrediction() {
    this.predictedInputs = [];
  }
}

export default carKeyboardDriver;
