/**
 * Creates triangle mesh
 *
 * @param {FGL} fgl
 * @param {Object} config
 *
 * @returns {Mesh}
 */
const createPyramid = fgl => config => fgl.mesh(
  {
    // not filled triangles
    renderMode: fgl.flags.LINES,
    material: fgl.material.solidColor,
    vertices: [
      // bottom rectangle
      [0, 0, 0], [1, 0, 0],
      [1, 0, 0], [1, 1, 0],
      [1, 1, 0], [0, 1, 0],
      [0, 1, 0], [0, 0, 0],

      // corners
      [0, 0, 0], [0.5, 0.5, -1],
      [1, 0, 0], [0.5, 0.5, -1],
      [1, 1, 0], [0.5, 0.5, -1],
      [0, 1, 0], [0.5, 0.5, -1],
    ],
    ...config,
  },
);

export default createPyramid;
