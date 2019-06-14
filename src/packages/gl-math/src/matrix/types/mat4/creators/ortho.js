import mat4 from '../mat4';

/**
 * Creates blank orthographic matrix
 *
 * @see
 *  {@link} https://www.khronos.org/registry/OpenGL-Refpages/gl2.1/xhtml/glOrtho.xml
 *  {@link} https://en.wikipedia.org/wiki/Orthographic_projection
 *
 * @param {Object}  config
 * @returns {Matrix}
 *
 * @export
 */
const ortho = ({
  left, right,
  bottom, top,
  near, far,
}) => {
  const dX = right - left;
  const dY = top - bottom;
  const dZ = far - near;

  return mat4(
    [
      2 / dX, 0, 0, -((right + left) / dX),
      0, 2 / dY, 0, -((top + bottom) / dY),
      0, 0, -2 / dZ, -((far + near) / dZ),
      0, 0, 0, 1,
    ],
  );
};

export default ortho;
