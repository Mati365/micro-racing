import {vec2, Edge} from '@pkg/gl-math';

import {intersectVec2Point} from '../utils/getRaysIntersection';

export class MTV {
  constructor() {
    this.translate = vec2(0, 0);
    this.intersections = [];
  }
}

/**
 * @see
 *  {@link https://www.youtube.com/watch?v=7Ik2vowGcU0}
 *  {@link https://stackoverflow.com/questions/11654990/2d-physics-engine-collision-response-rotation-of-objects/31052526?fbclid=IwAR36fydHkfdouFhoYoeKOfNNFI4tfvXdf5QzJRvpvh1rPSHdCsw6j0ptFHk#31052526}
 *
 * @param {Shape} a
 * @param {Shape} b
 *
 * @returns {MTV}
 */
const diagonalCollisionsCheck = (a, b) => {
  const {vertices: verticesA} = a;
  const {vertices: verticesB} = b;

  let mtv = null;

  for (let i = 0; i < verticesA.length; ++i) {
    const vertexA = verticesA[i];
    const diagonal = new Edge(a.center, vertexA);

    for (let j = 0; j < verticesB.length; ++j) {
      const edgeB = new Edge(verticesB[j], verticesB[(j + 1) % verticesB.length]);
      const intersection = intersectVec2Point(diagonal, edgeB);

      if (intersection) {
        if (!mtv)
          mtv = new MTV;

        mtv.intersections.push(intersection);
        mtv.translate = vec2.add(
          mtv.translate,
          vec2.mul(
            1.0 - intersection.uA,
            diagonal.vectorize(),
          ),
        );
      }
    }
  }

  return mtv;
};

export const isDiagonalCollisionWithEdge = (body, edge) => {
  if (!body || !edge)
    return null;

  const {vertices} = body;
  const diagonal = new Edge(body.center, null);

  for (let i = 0; i < vertices.length; ++i) {
    diagonal.to = vertices[i];

    const intersection = intersectVec2Point(diagonal, edge);
    if (intersection)
      return intersection;
  }

  return null;
};

export default diagonalCollisionsCheck;
