import * as R from 'ramda';

const cross = (a, b, o) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

/**
 * @see https://en.wikibooks.org/wiki/Algorithm_Implementation/Geometry/Convex_hull/Monotone_chain
 *
 * @param {Point[]} points
 *
 * @returns {Point[]}
 */
const convexHull = (points) => {
  if (!points || points.length < 2)
    return [];

  const sortedPoints = R.sort(
    (a, b) => (
      a.x === b.x
        ? a.y - b.y
        : a.x - b.x
    ),
    points,
  );

  const lower = [];
  const upper = [];

  for (let i = 0; i < sortedPoints.length; ++i) {
    const point = sortedPoints[i];

    while (
      lower.length >= 2
        && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0
    ) {
      lower.pop();
    }

    lower.push(point);
  }

  for (let i = sortedPoints.length - 1; i >= 0; --i) {
    const point = sortedPoints[i];

    while (
      upper.length >= 2
        && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0
    ) {
      upper.pop();
    }

    upper.push(point);
  }

  upper.pop();
  lower.pop();

  return [
    ...upper,
    ...lower,
  ];
};

export default convexHull;
