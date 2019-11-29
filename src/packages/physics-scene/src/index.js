import {
  smallestAngleDistance,
  wrapAngleTo2PI,
  vec2,
  toRadians,
} from '@pkg/gl-math';

import {
  aabb,
  diagonal,
} from './engines';

export default class PhysicsScene {
  constructor({
    items,
    maxReflectionAngle,
    ...config
  } = {}) {
    this.config = {
      maxReflectionAngle: config.maxReflectionAngle || toRadians(70),
      ...config,
    };

    this.items = items || [];
  }

  performBodyReaction(a, b, mtv) {
    const {config} = this;

    if (a.moveable) {
      a.pos = vec2.add(a.pos, mtv.translate);

      if (a.speed > 0.1) {
        // apply impulses
        const {intersections} = mtv;

        for (let k = 0; k < intersections.length; ++k) {
          const intersection = intersections[k];
          const edgeNormal = intersection.edgeB.normal(true);

          const newVelocity = vec2.reflectByNormal(edgeNormal, a.velocityVector, true);
          const newAngle = wrapAngleTo2PI(
            Math.atan2(newVelocity.y, newVelocity.x),
          );

          const angleDelta = -smallestAngleDistance(a.angle, newAngle);
          a.velocity = vec2.mul(0.9, a.velocity);

          // performs bounce if < maxReflectionAngle
          if (Math.abs(angleDelta) < config.maxReflectionAngle + Math.PI / 2)
            a.angularVelocity += -angleDelta / (1 / a.speed * 40);
        }
      }

      a.updateVerticesShapeCache();
    }

    if (b.moveable) {
      b.pos = vec2.sub(b.pos, vec2.mul(0.1, mtv.translate));
      b.updateVerticesShapeCache();
    }
  }

  updateObjectPhysics(a) {
    const {items} = this;
    const {box: boxA} = a;

    for (let j = 0; j < items.length; ++j) {
      const item = items[j];
      const b = item.body || item;

      if (a === b || (!a.moveable && !b.moveable))
        continue;

      // ignore if not AABB, it is much faster than diagonal checks
      const {box: boxB} = b;
      if (!boxB || !aabb(boxA, boxB))
        continue;

      // DIAGONAL
      const mtv = diagonal(a, b);
      if (mtv) {
        // prevent wrong edge collision behaviour
        if (a.speed >= b.speed)
          this.performBodyReaction(a, b, mtv);
        else
          this.performBodyReaction(b, a, {...mtv, translate: vec2.mul(-1, mtv.translate)});
      }
    }
  }

  update(delta) {
    const {items} = this;

    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const body = item.body || item;

      body.update(delta);
      this.updateObjectPhysics(body);
    }

    return false;
  }
}
