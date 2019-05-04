import Vector from '../../../../classes/Vector';

/**
 * Cretes 2D vector from angle and length
 *
 * @param {Number} scalar Length of vector
 * @param {Number} angle  Angle of vector

 * @returns {Vec2}
 */
const fromScalar = (scalar, angle = 0) => new Vector([
  Math.cos(angle) * scalar,
  Math.sin(angle) * scalar,
]);

export default fromScalar;
