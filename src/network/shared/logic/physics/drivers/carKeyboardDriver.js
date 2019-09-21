import {toRadians} from '@pkg/gl-math';

const ROTATE_CAR_SPEED = toRadians(1);

const KEYCODES = {
  LEFT: 37,
  RIGHT: 39,
  W: 87,
  S: 83,
};

const carKeyboardDriver = (keyMap, carBody) => {
  if (!carBody)
    return;

  // left
  if (keyMap[KEYCODES.LEFT])
    carBody.turn(-ROTATE_CAR_SPEED);

  // right
  else if (keyMap[KEYCODES.RIGHT])
    carBody.turn(ROTATE_CAR_SPEED);

  // w
  if (keyMap[KEYCODES.W])
    carBody.speedUp(4);

  // s
  if (keyMap[KEYCODES.S])
    carBody.speedUp(-4);
};

export default carKeyboardDriver;
