import Vector from '../../../../classes/Vector';

/**
 * @see https://matthew-brett.github.io/teaching/rotation_2d.html
 */
const rotateVec2 = (angle, v) => {
  const x = v[0], y = v[1];
  const sA = Math.sin(angle);
  const cA = Math.cos(angle);

  return new Vector([
    (cA * x) - (sA * y),
    (sA * x) + (cA * y),
  ]);
};

export default rotateVec2;
