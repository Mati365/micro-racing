import {
  createVertexBuffer,
  createIndexBuffer,
} from '../Buffer';

/**
 * Creates mesh with VBO, IBO
 *
 * @param {WebGLRenderingContext} gl
 * @param {FGLContext} fglContext
 *
 * @returns {Function}
 */
const createMesh = (gl, fglContext) => ({
  vertices,
  indices,
  material,
  drawMode = gl.STATIC_DRAW,
}) => {
  const meshInfo = Object.freeze({
    material,
    vbo: vertices && createVertexBuffer(gl, vertices, drawMode),
    ibo: indices && createIndexBuffer(gl, indices, drawMode),
  });

  console.log(meshInfo, fglContext);

  /**
   * Return render invoker
   *
   * @returns
   */
  return () => {};
};

export default createMesh;
