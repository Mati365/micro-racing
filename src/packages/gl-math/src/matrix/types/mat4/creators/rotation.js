import mat4 from '../mat4';
import {identity} from '../../mat/creators/identity';

/**
 * Creates rotation mat4 matrix
 *
 * @see
 *  https://gamedev.stackexchange.com/a/57597
 *
 * @param {Vec3} vec3
 *
 * @returns {Mat4}
 */
const rotation = (vec3) => {
  const [x, y, z] = vec3;
  if (x === 0 && y === 0 && z === 0)
    return identity(4);

  const cosX = Math.cos(x), sinX = Math.sin(x);
  const cosY = Math.cos(y), sinY = Math.sin(y);
  const cosZ = Math.cos(z), sinZ = Math.sin(z);

  // cos(y)cos(z)  -cos(x)sin(z) + sin(x)sin(y)cos(z)   sin(x)sin(z) + cos(x)sin(y)cos(z)
  // cos(y)sin(z)   cos(x)cos(z) + sin(x)sin(y)sin(z)  -sin(x)cos(z) + cos(x)sin(y)sin(z)
  // -sin(y)         sin(x)cos(y)                        cos(x)cos(y)

  return mat4([
    // first row
    cosZ * cosY, -cosX * sinZ + sinX * sinY * cosZ, sinX * sinZ + cosX * sinY * cosZ, 0.0,

    // second row
    cosY * sinZ, cosX * cosZ + sinX * sinY * sinZ, -sinX * cosZ + cosX * sinY * sinZ, 0.0,

    // third row
    -sinY, sinX * cosY, cosX * cosY, 0.0,

    // fourth row
    0.0, 0.0, 0.0, 1.0,
  ]);
};

export default rotation;
