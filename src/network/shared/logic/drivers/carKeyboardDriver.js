import INPUT_FLAGS, {ACTION_KEYCODES_MAP} from '@game/network/constants/inputFlags';

import {toRadians} from '@pkg/gl-math';
import {
  setBit,
  getBit,
  assignElementListeners,
} from '@pkg/basic-helpers';

import PlayerInput from '@game/network/shared/PlayerInput';

const ROTATE_CAR_SPEED = toRadians(1);

const isInputActive = () => (
  document.activeElement?.tagName === 'INPUT'
);


/**
 * @see
 * Class maps keyboard inputs into flags that
 * is used by carKeyboardDriver method later in
 * server or client updater code
 */
export class GameKeyboardController {
  inputs = 0;

  inputsCounter = 0;

  predictedInputs = [];

  batch = [];


  constructor(canvas) {
    this.canvas = this.attachCanvasListeners(canvas);
  }

  release() {
    this.unmountListeners?.();
  }

  attachCanvasListeners(canvas) {
    this.unmountListeners?.();
    this.unmountListeners = assignElementListeners(
      {
        keyup: (e) => {
          this.inputs = setBit(
            ACTION_KEYCODES_MAP[e.which],
            0,
            this.inputs,
          );
        },

        keydown: (e) => {
          if (isInputActive())
            return;

          this.inputs = setBit(
            ACTION_KEYCODES_MAP[e.which],
            1,
            this.inputs,
          );
        },
      },
    )(window);

    return canvas;
  }

  storeInputs(frameId) {
    const {predictedInputs, batch, inputs} = this;
    const input = new PlayerInput(
      (this.inputsCounter++) % 0xFFFF, // due to binary serializer
      frameId,
      inputs,
    );

    batch.push(input);
    predictedInputs.push(input);

    return input;
  }

  /**
   * @see
   *  Send current batch to server!
   */
  flushBatch() {
    const list = this.batch;
    list.forEach((item) => {
      item.tempOnly = false;
    });

    this.batch = [];
    return list;
  }

  flushPrediction() {
    this.predictedInputs = [];
  }
}


const carKeyboardDriver = (input, carBody) => {
  if (!carBody)
    return;

  // left
  if (getBit(INPUT_FLAGS.TURN_LEFT, input))
    carBody.turnSteerWheels(-ROTATE_CAR_SPEED);

  // right
  else if (getBit(INPUT_FLAGS.TURN_RIGHT, input))
    carBody.turnSteerWheels(ROTATE_CAR_SPEED);

  // w
  if (getBit(INPUT_FLAGS.THROTTLE, input))
    carBody.speedUp(4);

  // s
  if (getBit(INPUT_FLAGS.BRAKE, input))
    carBody.speedUp(-4);
};

export default carKeyboardDriver;
