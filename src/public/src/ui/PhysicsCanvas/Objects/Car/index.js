import {
  fillRect,
  drawRect,
} from '@pkg/ctx';

import CarPhysicsBody from './CarPhysicsBody';

const drawWheel = (size, wheel, body, ctx) => {
  const {
    size: carSize,
    steerAngle,
  } = body;

  const {pos, steering} = wheel;
  const relativePos = {
    x: -size.x / 2,
    y: -size.y / 2,
    w: size.x,
    h: size.y,
  };

  ctx.save();
  ctx.translate(
    pos.x * carSize.x,
    pos.y * carSize.y,
  );

  if (steering)
    ctx.rotate(steerAngle);

  fillRect(relativePos, '#fff', ctx);
  ctx.restore();
};

export default class Car {
  constructor(bodyConfig) {
    this.body = new CarPhysicsBody(bodyConfig);
  }

  update(delta) {
    this.body.update(delta);
  }

  render(ctx) {
    const {
      angle, pos, size,
      wheelSize, wheels,
    } = this.body;

    ctx.save();
    ctx.translate(
      pos.x + size.x / 2,
      pos.y + size.y / 2,
    );
    ctx.rotate(angle);
    ctx.translate(
      -size.x / 2,
      -size.y / 2,
    );

    drawRect(
      {
        x: 0,
        y: 0,
        w: size.x,
        h: size.y,
      },
      1,
      '#fff',
      ctx,
    );

    const realWheelSize = {
      x: wheelSize.x * size.x,
      y: wheelSize.y * size.y,
    };

    for (let i = wheels.length - 1; i >= 0; --i) {
      const wheel = wheels[i];

      drawWheel(
        realWheelSize,
        wheel,
        this.body,
        ctx,
      );
    }

    ctx.restore();
  }
}
