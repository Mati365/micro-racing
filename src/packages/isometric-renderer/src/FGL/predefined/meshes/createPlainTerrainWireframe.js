/**
 * Creates board(like chess) of not filled quads
 *
 * @param {FGL} fgl
 * @param {Object} config
 *
 * @returns {Mesh}
 */
const createPlainTerrainWireframe = fgl => config => fgl.mesh(
  {
    vertices: [
      0.5, 0.0, 0.0,
      0.0, 1.0, 0.0,
      1.0, 1.0, 0.0,
    ],
    ...config,
  },
);

export default createPlainTerrainWireframe;
