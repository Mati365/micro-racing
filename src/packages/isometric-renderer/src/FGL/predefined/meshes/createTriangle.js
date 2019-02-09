/**
 * Creates triangle mesh
 *
 * @param {FGL} fgl
 * @param {Object} config
 *
 * @returns {Mesh}
 */
const createTriangle = fgl => config => fgl.mesh(
  {
    material: fgl.material.solidColor,
    vertices: [
      [0.5, 0.0, 0.0],
      [0.0, 1.0, 0.0],
      [1.0, 1.0, 0.0],
    ],
    ...config,
  },
);

export default createTriangle;
