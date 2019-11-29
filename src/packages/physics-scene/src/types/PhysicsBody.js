import * as R from 'ramda';

import {
  lerp,
  wrapAngleTo2PI,
  vec2,
  getPathCornersBox,
} from '@pkg/gl-math';

export default class PhysicsBody {
  constructor({
    pos,
    points,
    size,
    moveable = false,
    angle = 0,
    speed = 0,
  }) {
    this.pos = pos;
    this.points = points || PhysicsBody.genRectanglePoints(size);
    this.size = size; // todo: add autodetect if not present
    this.moveable = R.defaultTo(true, moveable);
    this.angle = angle;
    this.angularVelocity = 0;
    this.speed = speed;

    this.shapeCache = {
      vertices: [],
      box: null,
    };

    this.updateVerticesShapeCache();
  }

  get box() { return this.shapeCache.box; }

  get vertices() { return this.shapeCache.vertices; }

  updateVerticesShapeCache = this.cacheByPos(() => {
    const {shapeCache, points} = this;
    const {vertices} = shapeCache;

    for (let i = 0; i < points.length; ++i)
      vertices[i] = this.relativeBodyVector(points[i]);

    shapeCache.box = getPathCornersBox(vertices);
    return shapeCache;
  });

  static genRectanglePoints(size) {
    const [pW, pH] = [size.w / 2, size.h / 2];

    return [
      vec2(-pW, pH),
      vec2(pW, pH),
      vec2(pW, -pH),
      vec2(-pW, -pH),
    ];
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
    this.speed += delta;
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
    const {angle, speed} = this;

    return vec2(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
    );
  }

  interpolatedUpdate = (() => {
    const interpolationCache = {};
    const interpolateState = {
      prevState: null,
      state: null,
    };

    return (interpolate) => {
      const {moveable} = this;
      const {alpha} = interpolate;

      if (!moveable)
        return this;

      if (interpolate.fixedStepUpdate) {
        this.update();

        interpolateState.prevState = interpolateState.state;
        interpolateState.state = {
          pos: vec2.clone(this.pos),
          angle: this.angle,
        };
      }

      if (!interpolateState.prevState || (!interpolate.lerpUpdate && !interpolationCache.pos))
        return this;

      if (interpolate.lerpUpdate) {
        interpolationCache.angle = lerp(
          interpolateState.prevState.angle,
          interpolateState.state.angle,
          alpha,
        );

        interpolationCache.pos = vec2.lerp(
          alpha,
          interpolateState.prevState.pos,
          interpolateState.state.pos,
        );
      }

      return interpolationCache;
    };
  })();

  update() {
    const {
      moveable, pos, angle,
      velocityVector, angularVelocity,
    } = this;

    if (!moveable)
      return;

    this.pos = vec2.add(pos, velocityVector);
    this.angle = wrapAngleTo2PI(angle + angularVelocity);
    this.angularVelocity *= 0.9;
    this.velocity *= 0.99;

    this.updateVerticesShapeCache();
  }
}
