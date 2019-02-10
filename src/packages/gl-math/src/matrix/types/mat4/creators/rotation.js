import mat4 from '../mat4';

/**
 * Creates rotation mat4 matrix
 *
 * @see
 *  http://marcin.kielczewski.pracownik.put.poznan.pl/ZSP02.pdf
 *
 * @param {Vec3} vec3
 *
 * @returns {Mat4}
 */
const rotation = (vec3) => {
  const [x, y, z] = vec3;

  const cosX = Math.cos(x), sinX = Math.sin(x);
  const cosY = Math.cos(y), sinY = Math.sin(y);
  const cosZ = Math.cos(z), sinZ = Math.sin(z);

  return mat4([
    // first row
    cosZ * cosY,
    cosZ * sinY * sinX - sinZ * cosX,
    cosZ * sinY * cosX + sinZ * sinX,
    0.0,

    // second row
    sinZ * cosY,
    sinZ * sinY * sinX + cosZ * cosX,
    sinZ * sinY * cosX - cosZ * sinX,
    0.0,

    // thrid row
    -sinX,
    cosY * sinX,
    cosY * sinX,
    0.0,

    // fourth row
    0.0,
    0.0,
    0.0,
    1.0,
  ]);
};

export default rotation;
