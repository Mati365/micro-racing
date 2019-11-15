import * as R from 'ramda';
import {
  wrapAngleTo2PI,
  vec2,
  getPathCornersBox,
} from '@pkg/gl-math';

export default class PhysicsBody {
  constructor({
    pos,
    points,
    moveable,
    angle = 0,
    velocity = 0,
  }) {
    this.pos = pos;
    this.points = points;
    this.moveable = R.defaultTo(true, moveable);
    this.angle = angle;
    this.angularVelocity = 0;
    this.velocity = velocity;

    Object.defineProperty(this, 'vertices', {
      get: this.cacheByPos(
        () => this.points.map(
          p => this.relativeBodyVector(p),
        ),
      ),
    });

    Object.defineProperty(this, 'box', {
      get: this.cacheByPos(
        () => getPathCornersBox(this.vertices),
      ),
    });
  }

  cacheByPos(fn) {
    const prevState = {
      pos: vec2(null, null),
      prevAngle: null,
    };

    let cachedValue = null;

    return () => {
      if (cachedValue
          && this.pos.equals(prevState.pos)
          && this.angle === prevState.angle)
        return cachedValue;

      prevState.pos.xy = this.pos;
      prevState.angle = this.angle;

      cachedValue = fn();
      return cachedValue;
    };
  }

  speedUp(delta) {
    this.velocity += delta;
  }

  turn(delta) {
    this.angularVelocity *= 0.3;
    this.angle += delta;
  }

  relativeBodyVector(v) {
    const {angle, pos} = this;

    if (!angle)
      return vec2.add(pos, v);

    return vec2.add(
      vec2.rotate(angle, v),
      pos,
    );
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

  update() {
    const {pos, angle, velocityVector, angularVelocity} = this;

    this.pos = vec2.add(pos, velocityVector);
    this.angle = wrapAngleTo2PI(angle + angularVelocity);
    this.angularVelocity *= 0.9;
    this.velocity *= 0.99;
  }
}
