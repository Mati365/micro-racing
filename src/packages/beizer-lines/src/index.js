import vec2 from '@pkg/gl-math/matrix/types/vec2';

export const quadraticBeizerLine = (p0, p1, p2, t) => {
  const dt = 1 - t;

  return vec2(
    dt * dt * p0.x + 2 * dt * t * p1.x + t * t * p2.x,
    dt * dt * p0.y + 2 * dt * t * p1.y + t * t * p2.y,
  );
};

export const deCasteljau2Points = (p0, p1, p2, t) => {
  const q = vec2.lerp(t, p0, p1);
  const r = vec2.lerp(t, p1, p2);
  const p = vec2.lerp(t, q, r);

  return p;
};

/**
 * @see
 *  https://www.khanacademy.org/partner-content/pixar/animate/parametric-curves/v/a6-final
 *  https://www.youtube.com/watch?v=YATikPP2q70
 *
 * @param {Vec2} p0
 * @param {Vec2} p1
 * @param {Vec2} p2
 */
export const deCasteljau = (
  {
    spacing = 10,
    inclusive = {
      left: true,
      right: false,
    },
    points: [
      A,
      B,
    ],
    handlers: [
      cA,
      cB,
    ],
  },
) => {
  const fixedStep = spacing / 4.0 / vec2.dist(A, B);

  const reduced = [];
  let t = inclusive.left ? 0.0 : fixedStep;

  let prevPoint = A;

  while (inclusive.right ? t <= 1.0 : t < 1.0) {
    t += fixedStep;

    const p0 = vec2.lerp(t, A, cA); // lerp between curve handler A and cA
    const p1 = vec2.lerp(t, cA, cB); // lerp between curve handler cA and cB
    const p2 = vec2.lerp(t, cB, B); // lerp between curve handler B and cB

    let point = quadraticBeizerLine(
      p0,
      deCasteljau2Points(p0, p1, p2, t),
      p2,
      t,
    );

    const dist = vec2.dist(prevPoint, point);
    if (dist >= spacing) {
      const missDist = dist - spacing;
      const prevPointVector = vec2.normalize(vec2.sub(prevPoint, point));

      point = vec2.add(point, vec2.mul(missDist, prevPointVector));
      prevPoint = point;

      reduced.push(point);
    }
  }

  return reduced;
};
