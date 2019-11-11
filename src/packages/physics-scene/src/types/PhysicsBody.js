import {vec2} from '@pkg/gl-math';

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
    this.moveable = moveable;
    this.angle = angle;
    this.velocity = velocity;

    const cacheByPos = (fn) => {
      const prevState = {
        pos: vec2(null, null),
        prevAngle: null,
      };

      let cachedList = null;

      return () => {
        if (cachedList
            && this.pos.equals(prevState.pos)
            && this.angle === prevState.angle)
          return cachedList;

        prevState.pos.xy = this.pos;
        prevState.angle = this.angle;

        cachedList = fn();
        return cachedList;
      };
    };

    Object.defineProperty(this, 'vertices', {
      get: cacheByPos(
        () => this.points.map(
          p => this.relativeBodyVector(p),
        ),
      ),
    });
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

  /* eslint-disable class-methods-use-this */
  update() {}
  /* eslint-enable class-methods-use-this */
}
