import {removeNullValues} from '@pkg/basic-helpers';
import {
  createVertexBuffer,
  createIndexBuffer,
} from '../buffer';

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

  // gl low level flags
  renderMode = gl.TRIANGLE_STRIP,
  usage = gl.STATIC_DRAW,
}) => Object.freeze({
  material,
  renderMode,
  buffers: removeNullValues({
    vbo: vertices && createVertexBuffer(gl, vertices, usage),
    ibo: indices && createIndexBuffer(gl, indices, usage),
  }),
});

export default createMeshDescriptor;
