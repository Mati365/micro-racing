import {
  createVertexBuffer,
  createIndexBuffer,
} from '../Buffer';

/**
 * Creates mesh with VBO, IBO
 *
 * @param {WebGLRenderingContext} gl
 *
 * @returns {Number}
 */
const createMesh = gl => ({
  drawMode = gl.STATIC_DRAW,
  vertices,
  indices,
}) => Object.freeze({
  vbo: vertices && createVertexBuffer(gl, vertices, drawMode),
  ibo: indices && createIndexBuffer(gl, indices, drawMode),
});

export default createMesh;
