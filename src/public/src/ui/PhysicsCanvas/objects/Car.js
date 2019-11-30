import {vec2} from '@pkg/gl-math';
import {
  drawLine,
  drawRect,
  fillCircle,
  drawPolygon,
} from '@pkg/ctx';

import PhysicsBody from '@pkg/physics/types/PhysicsBody';

class SimpleBody extends PhysicsBody {
  constructor({
    moveable = true,

    // left top corner
    pos = vec2(0, 0),
    size = vec2(0, 0),

    // size of wheel relative to size
    wheelSize = vec2(0.2, 0.25),

    // distance between axle and mass center
    // normalized to size and mass center
    axles = {
      front: -0.5,
      rear: 0.5,
    },
  }) {
    super(
      {
        pos,
        moveable,
        points: [
          vec2(-size.y / 2, size.x / 2),
          vec2(size.y / 2, size.x / 2),
          vec2(size.y / 2, -size.x / 2),
          vec2(-size.y / 2, -size.x / 2),
        ],
      },
    );

    this.size = size;
    this.wheelSize = wheelSize;
    this.wheelBase = axles.rear - axles.front;
  }
}

export default class Car {
  constructor(bodyConfig) {
    this.body = new SimpleBody(bodyConfig);
  }

  update(delta) {
    this.body.update(delta);
  }

  render(ctx) {
    const {pos, vertices, box} = this.body;

    fillCircle(
      pos,
      2,
      '#ff0000',
      ctx,
    );

    drawPolygon(
      vertices,
      '#fff',
      2,
      true,
      ctx,
    );

    drawLine(
      vertices[1],
      vertices[2],
      '#ff0000',
      2,
      ctx,
    );

    drawRect(
      box,
      1,
      '#0000ff',
      ctx,
    );
  }
}
