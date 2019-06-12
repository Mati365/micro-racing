/**
 * Creates triangle mesh
 *
 * @param {FGL} fgl
 * @param {Object} config
 *
 * @returns {Mesh}
 */
const createBox = fgl => config => fgl.mesh(
  {
    // not filled triangles
    renderMode: fgl.flags.LINES,
    material: fgl.material.solidColor,
    vertices: [
      // bottom rectangle
      [-0.5, -0.5, 0], [0.5, -0.5, 0],
      [0.5, -0.5, 0], [0.5, 0.5, 0],
      [0.5, 0.5, 0], [-0.5, 0.5, 0],
      [-0.5, 0.5, 0], [-0.5, -0.5, 0],

      // top rectangle
      [-0.5, -0.5, -1], [0.5, -0.5, -1],
      [0.5, -0.5, -1], [0.5, 0.5, -1],
      [0.5, 0.5, -1], [-0.5, 0.5, -1],
      [-0.5, 0.5, -1], [-0.5, -0.5, -1],

      // corners
      [-0.5, -0.5, 0], [-0.5, -0.5, -1],
      [0.5, -0.5, 0], [0.5, -0.5, -1],
      [0.5, 0.5, 0], [0.5, 0.5, -1],
      [-0.5, 0.5, 0], [-0.5, 0.5, -1],
    ],
    ...config,
  },
);

export default createBox;
