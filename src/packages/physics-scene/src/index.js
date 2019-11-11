import {
  reflectByNormal,
  smallestAngleDistance,
  wrapAngleTo2PI,
  vec2,
  toRadians,
} from '@pkg/gl-math';

import collisionsCheck from './engines/diagonal';

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

      if (a.velocity) {
        // apply impulses
        const {intersections} = mtv;

        for (let k = 0; k < intersections.length; ++k) {
          const intersection = intersections[k];
          const edgeNormal = intersection.edgeB.normal(true);

          const newVelocity = reflectByNormal(edgeNormal, a.velocityVector, true);
          const newAngle = wrapAngleTo2PI(
            Math.atan2(newVelocity.y, newVelocity.x),
          );

          const angleDelta = -smallestAngleDistance(a.angle, newAngle);
          a.velocity *= 0.95;

          // performs bounce if < maxReflectionAngle
          if (a.velocity > 0.1) {
            const cornerCollision = intersection.uB < 0.1 || intersection.uB > 0.9;

            if (!cornerCollision && Math.abs(angleDelta) < config.maxReflectionAngle + Math.PI / 2)
              a.angularVelocity = angleDelta / (1 / a.velocity * 50);
            else
              a.velocity = -a.velocity * 0.25;
          }
        }
      }
    }

    if (b.moveable)
      b.pos = vec2.sub(b.pos, mtv.translate);
  }

  update(delta) {
    const {items} = this;

    for (let i = 0; i < items.length; ++i) {
      const a = items[i];

      items[i].update(delta);

      for (let j = 0; j < items.length; ++j) {
        const b = items[j];
        if (i === j || (!a.moveable && !b.moveable))
          continue;

        const mtv = collisionsCheck(a, b);
        if (mtv)
          this.performBodyReaction(a, b, mtv);
      }
    }

    return false;
  }
}
