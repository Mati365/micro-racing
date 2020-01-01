import * as R from 'ramda';

import {isCornerCollisionWithEdge} from '@pkg/physics-scene/src/utils/getRaysIntersection';
import {aabb} from '@pkg/physics-scene/src/engines';

import {
  CornersBox, Vector,
  toRadians, vec2,
} from '@pkg/gl-math';

import CarCollidableRay, {DEFAULT_RAYS_SETTINGS} from './CarCollidableRay';

export default class CarIntersectRays {
  constructor(
    body,
    {
      viewDistance = DEFAULT_RAYS_SETTINGS.viewDistance,
      raysCount = DEFAULT_RAYS_SETTINGS.raysCount,
      raysViewportAngle = toRadians(80),
      renderInterpolation = false,
    } = {},
  ) {
    // car body
    this.body = body;

    // rays config
    this.viewDistance = viewDistance;
    this.raysCount = raysCount;
    this.raysViewportAngle = raysViewportAngle;
    this.renderInterpolation = renderInterpolation;

    // edges
    this.raysBox = new CornersBox(
      vec2(0, 0),
      vec2(0, 0),
    );

    this.rays = this.createRays();
  }

  update(physicsScene, checkOnlyWithStatic) {
    this.updateRaysPositions();

    if (physicsScene)
      this.checkCollisions(physicsScene, checkOnlyWithStatic);
  }

  /**
   * Iterates over all rays and picks closes intersection point,
   * instead of getClosesRaysIntersect(), returns array
   *
   * IT IS DEFAULTED TO 1
   *
   * @see
   *  getClosesRaysIntersect
   *  neuralControlCar
   *
   * @returns {RaysIntersection[]}
   */
  pickRaysClosestIntersects() {
    const {rays} = this;
    const raysIntersectPoints = [];

    for (let i = rays.length - 1; i >= 0; --i)
      raysIntersectPoints[i] = rays[i].getClosestRayIntersection();

    return raysIntersectPoints;
  }

  /**
   * Check position between each ray and each element on board
   *
   * @todo
   *  Add box rays
   *
   * @param {PhysicsScene} physicsScene
   * @param {boolean} checkOnlyWithStatic
   */
  checkCollisions(physicsScene, checkOnlyWithStatic) {
    const {body, rays, raysBox} = this;
    const {quadTree} = physicsScene;

    // reset collisions
    for (let i = rays.length - 1; i >= 0; --i) {
      const ray = rays[i];
      if (ray.collisionPoints.length)
        ray.collisionPoints = [];
    }

    // check with all bodies
    const items = quadTree.retrieve(raysBox);
    for (let j = 0, n = items.length; j < n; ++j) {
      let boardItemBody = items[j];
      if (boardItemBody.body)
        boardItemBody = boardItemBody.body;

      if (!boardItemBody || !boardItemBody.vertices || boardItemBody === body)
        continue;

      if (checkOnlyWithStatic && boardItemBody.moveable)
        continue;

      // check all rays collisions with body
      for (let i = rays.length - 1; i >= 0; --i) {
        const ray = rays[i];
        if (!aabb(ray.box, boardItemBody.box))
          continue;

        const intersectPoints = isCornerCollisionWithEdge(boardItemBody, ray.edge, true);

        if (intersectPoints.length)
          ray.collisionPoints = ray.collisionPoints.concat(intersectPoints);
      }
    }
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
      const bodyIntersectPoint = isCornerCollisionWithEdge(body, ray.edge)?.point || pos;
      ray.bodyAttachPoint = body.absoluteToBodyRelativeVector(bodyIntersectPoint);

      return ray;
    };

    /**
     * @todo Remove double updateRaysPosition call,
     * it mige be done in one call, in theory ofc
     */
    return R.compose(
      ::this.updateRaysPositions,
      R.map(setBodyAttachPoints),
      edges => this.updateRaysPositions(edges, 20000),
      R.times(
        () => new CarCollidableRay,
      ),
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
      raysBox,
      renderInterpolation,
      body,
      raysCount,
      raysViewportAngle,
    } = this;

    const rayAngle = raysViewportAngle / (this.raysCount - 1);
    const offset = -(raysViewportAngle / 2);

    raysBox.topLeft[0] = Infinity;
    raysBox.topLeft[1] = Infinity;

    raysBox.bottomRight[0] = -Infinity;
    raysBox.bottomRight[1] = -Infinity;

    for (let i = raysCount - 1; i >= 0; --i) {
      const ray = rays[i];
      const attachPoint = ray.bodyAttachPoint || Vector.ZERO;

      const from = body.relativeBodyVectorToAbsolute(attachPoint, renderInterpolation);
      const to = body.relativeBodyVectorToAbsolute(
        vec2.add(
          attachPoint,
          vec2.fromScalar(
            viewDistance,
            -(i * rayAngle) - offset,
          ),
        ),
        renderInterpolation,
      );

      ray.setEdgePoints(from, to);

      raysBox.topLeft[0] = Math.min(raysBox.topLeft[0], from[0], to[0]);
      raysBox.topLeft[1] = Math.min(raysBox.topLeft[1], from[1], to[1]);

      raysBox.bottomRight[0] = Math.max(raysBox.bottomRight[0], from[0], to[0]);
      raysBox.bottomRight[1] = Math.max(raysBox.bottomRight[1], from[1], to[1]);
    }

    return rays;
  }
}
