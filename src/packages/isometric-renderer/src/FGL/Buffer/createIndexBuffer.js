import createBuffer from './createBuffer';

/**
 * Creates OpenGL indices buffer
 *
 * @param {WebGLRenderingContext} GL
 * @param {Array} indices
 *
 * @returns {Number}
 */
const createIndexBuffer = (gl) => {
  const creator = createBuffer(gl);

  return indices => creator(
    {
      type: gl.ELEMENT_ARRAY_BUFFER,
      indices: new Uint16Array(indices),
    },
  );
};

export default createIndexBuffer;
