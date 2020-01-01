import {Edge, CornersBox, vec2} from '@pkg/gl-math';

export const DEFAULT_RAYS_SETTINGS = {
  raysCount: 6,
  viewDistance: 10,
};

export default class CarCollidableRay {
  constructor(edge = new Edge) {
    this.edge = edge;
    this.box = new CornersBox(
      vec2.zero(),
      vec2.zero(),
    );

    this.bodyAttachPoint = null; // absolute point,
    this.collisionPoints = []; // RaysIntersection
  }

  setEdgePoints(from, to) {
    const {box, edge} = this;

    edge.from = from;
    edge.to = to;

    box.topLeft[0] = Math.min(from[0], to[0]);
    box.topLeft[1] = Math.min(from[1], to[1]);

    box.bottomRight[0] = Math.max(from[0], to[0]);
    box.bottomRight[1] = Math.max(from[1], to[1]);

    return this;
  }

  /**
   * Finds point which has lowest uB
   *
   * @returns
   * @memberof CarCollidableRay
   */
  getClosestRayIntersection() {
    const {collisionPoints} = this;
    if (!collisionPoints.length)
      return null;

    let minIntersection = collisionPoints[0];
    for (let i = collisionPoints.length - 1; i >= 1; --i) {
      const intersection = collisionPoints[i];

      if (minIntersection.uB > intersection.uB)
        minIntersection = intersection;
    }

    return minIntersection;
  }
}
