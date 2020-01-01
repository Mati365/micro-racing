import {vec2} from '@pkg/gl-math';
import {
  drawLine,
  drawRect,
  fillCircle,
  drawPolygon,
} from '@pkg/ctx';

import PhysicsBody from '@pkg/physics/types/PhysicsBody';
import {CarIntersectRays} from '@game/logic/drivers/neural';

class SimpleBody extends PhysicsBody {
  constructor({
    moveable = true,

    // left top corner
    angle = 0.0,
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
        angle,
        moveable,
        perspectiveAngleCorrection: 0,
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
    this.intersectRays = new CarIntersectRays(
      this.body,
      {
        viewDistance: 100,
      },
    );
  }

  update(physicsScene) {
    this.body.update();
    this.intersectRays.update(physicsScene);
  }

  renderRays(ctx) {
    const {
      intersectRays: {
        raysBox,
        rays,
      },
    } = this;

    for (let i = rays.length - 1; i >= 0; --i) {
      const ray = rays[i];
      const intersection = ray.getClosestRayIntersection();

      drawLine(
        ray.edge.from,
        ray.edge.to,
        '#444',
        1,
        ctx,
      );

      fillCircle(ray.edge.from, 2, '#ff0000', ctx);
      drawRect(ray.box, 1, '#d11141', ctx);

      // draw collision points
      if (intersection) {
        fillCircle(
          intersection.point,
          2,
          '#00ff00',
          ctx,
        );
      }
    }

    drawRect(
      raysBox,
      1,
      '#00ff00',
      ctx,
    );
  }

  render(ctx) {
    const {pos, vertices, box} = this.body;

    this.renderRays(ctx);
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
