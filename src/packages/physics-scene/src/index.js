import {vec2} from '@pkg/gl-math';

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
    this.config = config;
    this.items = items || [];
  }

  static performBodyReaction(a, b, mtv) {
    if (!mtv)
      return;

    if (!a.moveable && b.moveable) {
      [a, b] = [b, a];
      mtv.translate = vec2.mul(-1, mtv.translate);
    }

    a.pos = vec2.add(a.pos, mtv.translate);

    // apply impulses
    const {intersections} = mtv;

    for (let k = 0; k < intersections.length; ++k) {
      const intersection = intersections[k];
      const edgeNormal = intersection.edgeB.normal(true);

      const newVelocity = vec2.reflectByNormal(edgeNormal, a.velocityVector, true);
      a.velocity = vec2.mul(0.5, newVelocity);
    }

    a.updateVerticesShapeCache();
  }

  updateObjectPhysics(a) {
    const {items} = this;
    const {box: boxA} = a;

    if (!boxA)
      return;

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
      if (mtv)
        PhysicsScene.performBodyReaction(a, b, mtv);

      const mtv2 = diagonal(b, a);
      if (mtv2)
        PhysicsScene.performBodyReaction(b, a, mtv2);
    }
  }

  update() {
    const {items} = this;

    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const body = item.body || item;

      body.update && body.update();
      this.updateObjectPhysics(body);
    }

    return false;
  }
}
