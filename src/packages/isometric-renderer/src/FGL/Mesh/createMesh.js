import {removeNullValues} from '@pkg/basic-helpers';
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
 * @returns {MeshInfo}
 */
const createMesh = gl => ({
  vertices,
  indices,
  material,
  drawMode = gl.STATIC_DRAW,
}) => Object.freeze({
  material,
  buffers: removeNullValues({
    vbo: vertices && createVertexBuffer(gl, vertices, drawMode),
    ibo: indices && createIndexBuffer(gl, indices, drawMode),
  }),
});

export default createMesh;
