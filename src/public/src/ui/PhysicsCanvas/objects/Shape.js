import {
  fillCircle,
  drawPolygon,
} from '@pkg/ctx';

import PhysicsBody from '@pkg/physics/types/PhysicsBody';

export default class Shape extends PhysicsBody {
  constructor({
    points,
    pos,
    angle = Math.PI / 4,
    moveable = false,
  }) {
    super(
      {
        pos,
        points,
        moveable,
        angle,
      },
    );
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
