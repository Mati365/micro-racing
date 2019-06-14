import mat4 from '../mat4';

/**
 * Creates perspetive matrix
 *
 * @see
 *  {@link} http://www.3dcpptutorials.sk/index.php?id=2
 *  {@link} https://computergraphics.stackexchange.com/questions/6365/inverse-value-in-a-perspective-matrix
 *
 * @param {Number}  fov Field of view(angle in radians)
 * @param {Number}  aspect width / height
 * @param {Number}  near
 * @param {Number}  far
 *
 * @returns {Matrix}
 *
 * @export
 */
const perspective = ({
  fov, aspect,
  near, far,
}) => {
  const tanFov = Math.tan(fov / 2);
  const distanceDelta = far - near;

  return mat4(
    [
      1 / (aspect * tanFov), 0, 0, 0,
      0, 1 / tanFov, 0, 0,
      0, 0, -((far + near) / distanceDelta), -((2 * far * near) / distanceDelta),
      0, 0, -1, 0,
    ],
  );
};

export default perspective;
