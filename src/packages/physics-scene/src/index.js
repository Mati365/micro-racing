import {vec2} from '@pkg/gl-math';
import collisionsCheck from './engines/diagonal';

export default class PhysicsScene {
  constructor({items, ...config} = {}) {
    this.config = config;
    this.items = items || [];
  }

  update(delta) {
    const {items} = this;

    for (let i = 0; i < items.length; ++i)
      items[i].update(delta);

    for (let i = 0; i < items.length; ++i) {
      const a = items[i];
      const staticObject = a.moveable === false;

      for (let j = 0; j < items.length; ++j) {
        const b = items[j];
        if (i === j)
          continue;

        const mtv = collisionsCheck(a, b);
        if (mtv) {
          if (staticObject)
            b.pos = vec2.sub(b.pos, mtv.translate);
          else {
            a.pos = vec2.add(a.pos, mtv.translate);

            // apply impulses
            const {intersections} = mtv;
            for (let k = 0; k < intersections.length; ++k) {
              const edgeNormal = intersections[k].edgeB.normal(true);
            }
          }

          break;
        }
      }
    }

    return false;
  }
}
