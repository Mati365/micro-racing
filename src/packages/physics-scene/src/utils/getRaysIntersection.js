import {Edge, vec2} from '@pkg/gl-math';

export default class RaysIntersection {
  constructor(point, uA, uB, edgeA, edgeB) {
    this.point = point;
    this.uA = uA;
    this.uB = uB;
    this.edgeA = edgeA;
    this.edgeB = edgeB;
  }
}

/**
 * Detects collision intersect point between two vectors
 *
 * @see
 * http://paulbourke.net/geometry/pointlineplane/
 * http://jeffreythompson.org/collision-detection/line-line.php
 *
 * x1 + uA (x2 - x1) = x3 + uB (x4 - x3)
 * y1 + uA (y2 - y1) = y3 + uB (y4 - y3)
 *
 * @param {Edge}  edge1  First line
 * @param {Edge}  edge2  Second line
 *
 * @returns {RaysIntersection}
 */
export const intersectVec2Point = (edge1, edge2) => {
  const {from: p1, to: p2} = edge1;
  const {from: p3, to: p4} = edge2;

  // divider is same for uA and uB
  const divider = (
    ((p4.y - p3.y) * (p2.x - p1.x)) - ((p4.x - p3.x) * (p2.y - p1.y))
  );

  // intersect point on first vector(p1, p2)
  const uA = (
    (((p4.x - p3.x) * (p1.y - p3.y)) - ((p4.y - p3.y) * (p1.x - p3.x)))
      / divider
  );

  // intersect point on second vector(p3, p4)
  const uB = (
    (((p2.x - p1.x) * (p1.y - p3.y)) - ((p2.y - p1.y) * (p1.x - p3.x)))
      / divider
  );

  // lines collide
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
    return new RaysIntersection(
      // collision point
      vec2(
        p1.x + (uA * (p2.x - p1.x)),
        p1.y + (uA * (p2.y - p1.y)),
      ),
      uA,
      uB,
      edge1,
      edge2,
    );
  }

  return null;
};

/**
 * Check collision with border of object
 *
 * @param {Body} body
 * @param {Edge} edge
 *
 * @returns {RaysIntersection|RaysIntersection[]}
 */
export const isCornerCollisionWithEdge = (body, edge, all = false) => {
  const {vertices} = body;

  const intersections = all ? [] : null;
  const corner = new Edge(null, null);

  for (let i = 0; i < vertices.length; ++i) {
    corner.from = vertices[i];
    corner.to = vertices[(i + 1) % vertices.length];

    const intersection = intersectVec2Point(corner, edge);
    if (intersection) {
      if (all)
        intersections.push(intersection);
      else
        return intersection;
    }
  }

  return intersections;
};
