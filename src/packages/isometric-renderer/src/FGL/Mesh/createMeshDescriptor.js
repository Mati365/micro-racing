import {removeNullValues} from '@pkg/basic-helpers';
import {
  createVertexBuffer,
  createIndexBuffer,
} from '../Buffer';

/**
 * Creates information about mesh, allocates buffers and other stuff
 *
 * @param {WebGLRenderingContext} gl
 * @param {FGLContext} fglContext
 *
 * @returns {MeshInfo}
 */
const createMeshDescriptor = gl => ({
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

export default createMeshDescriptor;
