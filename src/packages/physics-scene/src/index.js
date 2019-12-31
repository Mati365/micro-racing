import * as R from 'ramda';

import {vec2} from '@pkg/gl-math';
import QuadTree from '@pkg/quad-tree';

import {
  diagonal,
  aabb,
} from './engines';

export default class PhysicsScene {
  constructor(
    {
      sceneSize,
      items,
      ...config
    } = {},
  ) {
    this.config = config;
    this.quadTree = new QuadTree(sceneSize, null, items);
  }

  get items() {
    return this.quadTree.allNodes;
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
    const {quadTree} = this;
    const {box: boxA, moveable} = a;
    let collided = null;

    if (!moveable || !boxA)
      return collided;

    const siblings = quadTree.retrieve(boxA);
    for (let j = 0; j < siblings.length; ++j) {
      const item = siblings[j];
      if (item === a)
        continue;

      const b = item.body || item;

      // ignore if e.g. AI is testing neural network
      if (b.moveable && checkOnlyWithStatic)
        continue;

      if (a === b
          || (!a.moveable && !b.moveable)
          || (a.transparentToOthers && b.moveable)
          || b.transparentToOthers)
        continue;

      // ignore if not AABB, it is much faster than diagonal checks
      // quad tree already performs aabb for static, do it only for moveable
      const {box: boxB} = b;
      if (b.moveable && !aabb(boxA, boxB))
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

  resetMoveable() {
    const {quadTree, items} = this;

    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const body = item.body || item;

      if (body.moveable) {
        quadTree
          .remove(item)
          .insert(item);
      }
    }
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
