import {vec2} from '@pkg/gl-math';
import {
  fillCircle,
  drawPolygon,
} from '@pkg/ctx';

class SimpleBody {
  angle = 0;

  velocity = 0;

  constructor({
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
    this.pos = pos;
    this.size = size;
    this.wheelSize = wheelSize;
    this.wheelBase = axles.rear - axles.front;
  }

  relativeBodyRelativeVector(v) {
    const {angle, pos} = this;

    return vec2.add(
      vec2.rotate(angle, v),
      pos,
    );
  }

  get vertices() {
    const {size} = this;

    return [
      this.relativeBodyRelativeVector(vec2(-size.y / 2, size.x / 2)),
      this.relativeBodyRelativeVector(vec2(size.y / 2, size.x / 2)),
      this.relativeBodyRelativeVector(vec2(size.y / 2, -size.x / 2)),
      this.relativeBodyRelativeVector(vec2(-size.y / 2, -size.x / 2)),
    ];
  }

  get center() {
    return this.pos;
  }

  get velocityVector() {
    const {angle, velocity} = this;

    return vec2(
      Math.cos(angle) * velocity,
      Math.sin(angle) * velocity,
    );
  }

  speedUp(delta) {
    this.velocity += delta;
  }

  turn(delta) {
    this.angle += delta;
  }

  update() {
    const {pos, velocityVector} = this;

    this.pos = vec2.add(pos, velocityVector);
    this.velocity *= 0.99;
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
    const {pos, vertices} = this.body;

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
  }
}
