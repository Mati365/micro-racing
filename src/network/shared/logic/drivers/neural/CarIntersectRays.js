import * as R from 'ramda';

import {isCornerCollisionWithEdge} from '@pkg/physics-scene/src/utils/getRaysIntersection';
import {
  Edge, Vector,
  toRadians, vec2,
} from '@pkg/gl-math';

export default class CarIntersectRays {
  constructor(
    body,
    {
      viewDistance = 100,
      raysCount = 6,
      raysViewportAngle = toRadians(80),
    } = {},
  ) {
    // car body
    this.body = body;

    // rays config
    this.viewDistance = viewDistance;
    this.raysCount = raysCount;
    this.raysViewportAngle = raysViewportAngle;

    // edges
    this.rays = this.createRays();
  }

  update() {
    this.updateRaysPositions();
  }

  /**
   * Creates array of rays and attaches it
   * to BORDER of car bodys
   *
   * @returns {Edge[]}
   */
  createRays() {
    const {raysCount, body} = this;
    const {pos} = body;

    /**
     * iterates over all vectors and tries to find ray intersect with body lines
     * if found - sets bodyAttachPoint to
     * unless - sets bodyAttachPoint vector vectorto massCenter
     *
     * @see
     *  bodyAttachPoint MUST BE RELATIVE TO BODY CENTER NOT GLOBAL ORIGIN!!!!
     *  ...due to rotation issues
     */
    const setBodyAttachPoints = (ray) => {
      const bodyIntersectPoint = isCornerCollisionWithEdge(body, ray)?.point || pos;

      return {
        ...ray,
        // make it relative to center pos of body
        // bodyAttachPoint: ZERO_VEC2,
        bodyAttachPoint: body.absoluteToBodyRelativeVector(bodyIntersectPoint),

        // used in collision updater
        collisionPoints: [],
      };
    };

    /**
     * @todo Remove double updateRaysPosition call,
     * it mige be done in one call, in theory ofc
     */
    return R.compose(
      ::this.updateRaysPositions,
      R.map(setBodyAttachPoints),
      edges => (
        this.updateRaysPositions(edges, 20000)
      ),
      Edge.createBlankEdges,
    )(raysCount);
  }

  /**
   * Because car's position is updating also
   * rays relative to car angle and other stuff,
   * do not use pure functions here, it is slow
   * and GC really dislikes it
   *
   * @param {Line[]} rays
   *
   * @returns {Line[]}
   */
  updateRaysPositions(
    rays = this.rays,
    viewDistance = this.viewDistance,
  ) {
    const {
      body,
      raysCount,
      raysViewportAngle,
    } = this;

    const rayAngle = raysViewportAngle / (this.raysCount - 1);
    const offset = -(raysViewportAngle / 2);

    for (let i = raysCount - 1; i >= 0; --i) {
      const ray = rays[i];
      const attachPoint = ray.bodyAttachPoint || Vector.ZERO;

      ray.from = body.relativeBodyVectorToAbsolute(attachPoint);
      ray.to = body.relativeBodyVectorToAbsolute(
        vec2.add(
          attachPoint,
          vec2.fromScalar(
            viewDistance,
            -(i * rayAngle) - offset,
          ),
        ),
      );
    }

    return rays;
  }
}
