import * as R from 'ramda';

import {vec2} from '@pkg/gl-math';
import {
  fillCircle,
  drawPolygon,
} from '@pkg/ctx';

export default class Shape {
  constructor({
    points,
    pos,
    moveable = false,
    renderNormals = true,
  }) {
    this.points = points;
    this.pos = pos;
    this.moveable = moveable;
    this.renderNormals = renderNormals;

    const cacheByPos = (fn) => {
      const prevPos = vec2(null, null);
      let cachedList = null;

      return () => {
        if (cachedList && this.pos.equals(prevPos))
          return cachedList;

        prevPos.xy = this.pos;
        cachedList = fn();

        return cachedList;
      };
    };

    Object.defineProperty(this, 'vertices', {
      get: cacheByPos(
        () => R.map(
          p => vec2.add(this.pos, p),
          this.points,
        ),
      ),
    });
  }

  get center() {
    return this.pos;
  }

  render(ctx) {
    const {pos} = this;

    drawPolygon(this.vertices, '#fff', 2, true, ctx);
    fillCircle(
      pos,
      2,
      '#ff0000',
      ctx,
    );
  }
}
