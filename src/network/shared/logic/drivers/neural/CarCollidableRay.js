import {Edge} from '@pkg/gl-math';

export default class CarCollidableRay {
  constructor(edge = new Edge) {
    this.edge = edge;
    this.bodyAttachPoint = null; // absolute point,
    this.collisionPoints = []; // RaysIntersection
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
