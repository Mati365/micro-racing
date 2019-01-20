import mat4 from './mat4';

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
}) => mat4(
  [
    2 / (right - left), 0, 0, -((right + left) / (right - left)),
    0, 2 / (top - bottom), 0, -((top + bottom) / (top - bottom)),
    0, 0, -2 / (far - near), -((far + near) / (far - near)),
    0, 0, 0, 1,
  ],
);

export default ortho;
