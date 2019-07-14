import {useMemo} from 'react';

import {vec2, toRadians} from '@pkg/gl-math';
import {createAnimationFrameRenderer} from '@pkg/isometric-renderer/FGL/core/viewport/createDtRenderLoop';

import Car from './objects/Car';

export default class PhysicsBoard {
  setCanvas({canvas, dimensions}) {
    this.canvas = canvas;
    this.dimensions = dimensions;
    this.ctx = canvas.getContext('2d');

    this.car = new Car(
      {
        pos: vec2(dimensions.w / 2, dimensions.h / 2),
        size: vec2(32, 64),
      },
    );

    canvas.addEventListener('keydown', (e) => {
      const rotateSpeed = toRadians(5);

      switch (e.keyCode) {
        case 37:
          this.car.body.turn(-rotateSpeed);
          break;

        case 39:
          this.car.body.turn(rotateSpeed);
          break;

        default:
      }
    });

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
