import {useMemo} from 'react';

import {vec2, toRadians} from '@pkg/gl-math';
import {createAnimationFrameRenderer} from '@pkg/isometric-renderer/FGL/core/viewport/createDtRenderLoop';

import PhysicsScene from '@pkg/physics';
import {Car, Shape} from './objects';

/**
 * @see
 * SAT:
 *  {@link https://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169}
 *  {@link http://www.dyn4j.org/2010/01/sat/}
 */
export default class PhysicsBoard {
  setCanvas({canvas, dimensions}) {
    this.canvas = canvas;
    this.dimensions = dimensions;
    this.ctx = canvas.getContext('2d');
    this.keycodes = {};

    this.car = new Car(
      {
        pos: vec2(dimensions.w / 2, dimensions.h / 2),
        size: vec2(32, 64),
      },
    );
    // this.car.body.velocity = 10;

    canvas.addEventListener('keydown', (e) => {
      this.keycodes[e.keyCode] = true;
    });

    canvas.addEventListener('keyup', (e) => {
      delete this.keycodes[e.keyCode];
    });

    this.physics = new PhysicsScene(
      {
        items: [
          this.car.body,
          new Shape(
            {
              pos: vec2(dimensions.w / 2 + 200, dimensions.h / 2 - 30),
              points: [
                vec2(-100, 100),
                vec2(100, 100),
                vec2(100, -100),
                vec2(-100, -100),
              ],
              moveable: false,
            },
          ),
        ],
      },
    );
    return this;
  }

  run() {
    createAnimationFrameRenderer(
      {
        allowLerpUpdate: false,
        render: (delta) => {
          this.update(delta);
          this.render(delta);
        },
      },
    );
  }

  update(delta) {
    const rotateSpeed = toRadians(4);
    const {car, keycodes, physics} = this;
    const {body} = car;

    if (keycodes[37])
      body.turn(-rotateSpeed);
    else if (keycodes[39])
      body.turn(rotateSpeed);

    if (keycodes[87])
      body.speedUp(0.1);
    else if (keycodes[83])
      body.speedUp(-0.1);

    physics.update(delta);
  }

  render(delta) {
    const {physics, car, ctx, dimensions} = this;

    if (!ctx)
      throw new Error('Missing canvas context!');

    // cleanup
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, dimensions.w, dimensions.h);

    // render test car
    car.render(ctx, delta);

    physics.items.forEach(
      item => item.render?.(ctx),
    );
  }
}

export const usePhysicsBoard = () => useMemo(
  () => new PhysicsBoard,
  [],
);
