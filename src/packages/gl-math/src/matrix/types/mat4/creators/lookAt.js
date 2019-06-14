import mat4 from '../mat4';
import vec3 from '../../vec3';

/**
 * @see {@link http://www.geertarien.com/blog/2017/07/30/breakdown-of-the-lookAt-function-in-OpenGL/}
 * @see {@link https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/lookat-function}
 * @see {@link https://stackoverflow.com/a/6802424}
 *
 * @returns {Mat4}
 */
const lookAt = ({eye, at, up}) => {
  let zAxis = vec3.normalize(vec3.sub(eye, at)); // normalize(eye - at)
  const xAxis = vec3.normalize(vec3.cross(up, zAxis)); // normalize(cross(zaxis, up))
  const yAxis = vec3.cross(xAxis, zAxis); // cross(xaxis, zaxis)

  zAxis = vec3.negate(zAxis);

  return mat4([
    xAxis[0], xAxis[1], xAxis[2], -vec3.dot(xAxis, eye),
    yAxis[0], yAxis[1], yAxis[2], -vec3.dot(yAxis, eye),
    zAxis[0], zAxis[1], zAxis[2], -vec3.dot(zAxis, eye),
    0, 0, 0, 1,
  ]);
};

export default lookAt;
