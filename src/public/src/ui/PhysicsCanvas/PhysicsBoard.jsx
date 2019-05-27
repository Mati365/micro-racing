import {useMemo} from 'react';

import {vec2, toRadians} from '@pkg/gl-math';
import {createAnimationFrameRenderer} from '@pkg/isometric-renderer/FGL/viewport/createDtRenderLoop';

import Car from './Objects/Car';

const ROTATE_CAR_SPEED = toRadians(1);

export default class PhysicsBoard {
  keyMap = {};

  setCanvas({canvas, dimensions}) {
    this.canvas = canvas;
    this.dimensions = dimensions;
    this.ctx = canvas.getContext('2d');

    this.car = new Car(
      {
        pos: vec2(dimensions.w / 2, dimensions.h - 100),
        size: vec2(32, 64),
      },
    );

    canvas.addEventListener('keydown', (e) => { this.keyMap[e.which] = true; }, true);
    canvas.addEventListener('keyup', (e) => { this.keyMap[e.which] = false; }, true);

    return this;
  }

  run() {
    createAnimationFrameRenderer(
      (delta) => {
        this.update(delta);
        this.render(delta);
      },
    );
  }

  update(delta) {
    const {car, keyMap} = this;

    // left
    if (keyMap[37])
      car.body.turn(-ROTATE_CAR_SPEED * delta);

    // right
    else if (keyMap[39])
      car.body.turn(ROTATE_CAR_SPEED * delta);

    // space
    if (keyMap[32])
      car.body.speedUp(0.1 * delta);

    this.car.update(delta);
  }

  render(delta) {
    const {car, ctx, dimensions} = this;

    if (!ctx)
      throw new Error('Missing canvas context!');

    // cleanup
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, dimensions.w, dimensions.h);

    // render test car
    car.render(ctx, delta);
  }
}

export const usePhysicsBoard = () => useMemo(
  () => new PhysicsBoard,
  [],
);
