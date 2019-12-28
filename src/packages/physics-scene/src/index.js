import * as R from 'ramda';

import {vec2} from '@pkg/gl-math';

import {
  aabb,
  diagonal,
} from './engines';

export default class PhysicsScene {
  constructor(
    {
      items,
      maxReflectionAngle,
      ...config
    } = {},
  ) {
    this.config = config;
    this.items = items || [];
  }

  static performBodyReaction(a, b, mtv) {
    if (!mtv)
      return;

    a.pos = vec2.add(a.pos, mtv.translate);

    // apply impulses
    const {intersections} = mtv;
    for (let k = 0; k < intersections.length; ++k) {
      const intersection = intersections[k];
      const cornerCollision = intersection.uB < 0.1 || intersection.uB > 0.9;

      let newVelocity = null;
      const edgeNormal = intersection.edgeB.normal(true);

      if (!cornerCollision) {
        newVelocity = vec2.reflectByNormal(
          edgeNormal,
          vec2.mul(0.5, a.velocityVector),
          true,
        );
      }

      if (newVelocity) {
        a.velocityVector = newVelocity;
        a.pos = vec2.add(a.pos, newVelocity);
      }
    }

    a.updateVerticesShapeCache();
  }

  updateObjectPhysics(a, checkOnlyWithStatic, toggleFlagOnStatic) {
    const {items} = this;
    const {box: boxA, moveable} = a;
    let collided = null;

    if (!moveable || !boxA)
      return collided;

    for (let j = 0; j < items.length; ++j) {
      const item = items[j];
      const b = item.body || item;

      // ignore if e.g. AI is testing neural network
      if (b.moveable && checkOnlyWithStatic)
        continue;

      if (a === b || (!a.moveable && !b.moveable) || b.transparentToOthers)
        continue;

      // ignore if not AABB, it is much faster than diagonal checks
      const {box: boxB} = b;
      if (!boxB || !aabb(boxA, boxB))
        continue;

      // DIAGONAL
      const mtv = diagonal(a, b);
      if (mtv)
        PhysicsScene.performBodyReaction(a, b, mtv);

      let mtv2 = diagonal(b, a);
      if (mtv2) {
        mtv2 = R.evolve(
          {
            translate: vec => vec2.mul(-1, vec),
            intersection: R.map(
              ({edgeA, edgeB, ...intersection}) => ({
                ...intersection,
                edgeA: edgeB,
                edgeB: edgeA,
              }),
            ),
          },
          mtv2,
        );

        PhysicsScene.performBodyReaction(a, b, mtv2);
      }

      if (!collided && (!toggleFlagOnStatic || !b.moveable))
        collided = mtv || mtv2 ? b : null;
    }

    return collided;
  }

  update(
    {
      checkOnlyWithStatic = false,
    } = {},
  ) {
    const {items} = this;

    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const body = item.body || item;

      body.update && body.update();
      this.updateObjectPhysics(body, checkOnlyWithStatic);
    }

    return false;
  }
}
