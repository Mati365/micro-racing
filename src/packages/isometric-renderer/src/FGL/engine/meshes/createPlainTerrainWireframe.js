import * as R from 'ramda';

/**
 * Creates board(like chess) of not filled quads
 *
 * @see
 *  Renders something like it:
 *
 *  +-------+
 *  |   |   |
 *  |-------|
 *  |   |   |
 *  +-------+
 *
 * @param {FGL} fgl
 * @param {Object} config
 *
 * @returns {Mesh}
 */
const createPlainTerrainWireframe = fgl => ({
  w,
  h,
  config = null,
  spacing = {
    x: 1 / w,
    y: 1 / h,
  },
}) => {
  const vertices = R.unnest([
    // TOP / BOTTOM
    ...R.times(
      (offset) => {
        const x = offset * spacing.x;
        return [
          [x, 0, 0],
          [x, 1.0, 0],
        ];
      },
      w + 1,
    ),

    // LEFT / RIGHT
    ...R.times(
      (offset) => {
        const y = offset * spacing.y;
        return [
          [0, y, 0],
          [1.0, y, 0],
        ];
      },
      h + 1,
    ),
  ]);

  return fgl.mesh(
    {
      renderMode: fgl.flags.LINES,
      material: fgl.material.solidColor,
      vertices,
      ...config,
    },
  );
};

export default createPlainTerrainWireframe;
