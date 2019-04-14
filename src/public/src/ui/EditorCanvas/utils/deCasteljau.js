
import vec2 from '@pkg/gl-math/matrix/types/vec2';

export const quadraticBeizerLine = (p0, p1, p2, t) => {
  const dt = 1 - t;

  return vec2(
    dt * dt * p0.x + 2 * dt * t * p1.x + t * t * p2.x,
    dt * dt * p0.y + 2 * dt * t * p1.y + t * t * p2.y,
  );
};

/**
 * @see
 *  https://www.khanacademy.org/partner-content/pixar/animate/parametric-curves/v/a6-final
 *
 * @param {Vec2} p0
 * @param {Vec2} p1
 * @param {Vec2} p2
 */
const deCasteljau = ({step}) => (p0, p1, p2) => {
  const reduced = [];

  for (let t = 0.0; t <= 1.0; t += step) {
    const q = vec2.lerp(t, p0, p1);
    const r = vec2.lerp(t, p1, p2);
    const p = vec2.lerp(0.5, q, r);

    reduced.push(
      quadraticBeizerLine(p0, p, p2, t),
    );
  }

  return reduced;
};

export const quadraticBeizer = mapperParams => (points) => {
  const srcPointsCount = points.length;

  let curvedPoints = []; // output
  const mapper = deCasteljau(mapperParams);

  for (let i = 0; i < srcPointsCount - 2; i += 2) {
    const p0 = points[i];
    const p1 = points[i + 1]; // <---- current
    const p2 = points[i + 2];

    curvedPoints = curvedPoints.concat(
      mapper(p0, p1, p2),
    );
  }

  return curvedPoints;
};

export default deCasteljau;
