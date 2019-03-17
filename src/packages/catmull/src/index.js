import {vec2} from '@pkg/gl-math/matrix';

const catmullPoints = (p1, p2, p3, p4, t) => (
  // eslint-disable-next-line max-len
  0.5 * ((2 * p2) + (-p1 + p3) * t + (2 * p1 - 5 * p2 + 4 * p3 - p4) * (t ** 2) + (-p1 + 3 * p2 - 3 * p3 + p4) * (t ** 3))
);

const catmullLine = (p1, p2, p3, p4, t) => vec2(
  catmullPoints(p1.x, p2.x, p3.x, p4.x, t),
  catmullPoints(p1.y, p2.y, p3.y, p4.y, t),
);

/**
 * Makes lines more curvy
 *
 * @see https://www.mvps.org/directx/articles/catmull/
 *
 * line between P2 - P3 is current performed line
 *
 *           [t]
 * P1 -- P2 ===== P3 -- P4
 *
 * @param {Object} config
 * @param {vec2[]} points
 *
 * @returns {vec2[]}
 */
const catmull = ({step}) => (points) => {
  const srcPointsCount = points.length;
  const curvedPoints = []; // output

  for (let i = 0; i < srcPointsCount; ++i) {
    const p1 = points[i ? i - 1 : srcPointsCount - 1];
    const p2 = points[(i + 1) % srcPointsCount]; // <---- current
    const p3 = points[(i + 2) % srcPointsCount];
    const p4 = points[(i + 3) % srcPointsCount];

    curvedPoints.push(p2);
    for (let t = 0; t < 1.0; t += step) {
      curvedPoints.push(
        catmullLine(p1, p2, p3, p4, t),
      );
    }
  }

  return curvedPoints;
};

export default catmull;
