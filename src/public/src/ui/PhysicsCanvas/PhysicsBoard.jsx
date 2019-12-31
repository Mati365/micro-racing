import {useMemo} from 'react';

import {vec2, toRadians, Rectangle} from '@pkg/gl-math';
import {createAnimationFrameRenderer} from '@pkg/isometric-renderer/FGL/core/viewport/createDtRenderLoop';

import {drawRect} from '@pkg/ctx';

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
        pos: vec2(943.6478881835938, 451.0608825683594),
        angle: 5.853485689369581,
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

    const points = [
      [dimensions.w / 2 + 200, dimensions.h / 2 - 130, 0],
      [dimensions.w / 2 + 300, dimensions.h / 2 - 130, 0],
      [dimensions.w / 2 + 400, dimensions.h / 2 - 130, 0],
      [dimensions.w / 2 + 500, dimensions.h / 2 - 130, 0],
      [dimensions.w / 2 + 600, dimensions.h / 2 - 130, 0],
    ];

    this.physics = new PhysicsScene(
      {
        sceneSize: new Rectangle(0, 0, dimensions.w, dimensions.h),
        items: [
          this.car,
          ...points.map(p => new Shape(
            {
              pos: vec2(p[0], p[1]),
              points: [
                vec2(-30, 30),
                vec2(30, 30),
                vec2(30, -30),
                vec2(-30, -30),
              ],
              angle: p[2],
              moveable: false,
            },
          )),
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
    const rotateSpeed = toRadians(8);
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

    const {items: list} = physics;
    for (let i = 0, len = list.length; i < len; ++i) {
      const item = list[i];

      item.update && item.update(physics);
      if (item.body)
        physics.updateObjectPhysics(item.body);
    }
  }

  render(delta) {
    const {physics, car, ctx, dimensions} = this;

    if (!ctx)
      throw new Error('Missing canvas context!');

    // cleanup
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, dimensions.w, dimensions.h);

    physics.quadTree.iterateQuads(
      (quad) => {
        drawRect(
          quad.box,
          1,
          '#00ff00',
          ctx,
        );
      },
    );

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
