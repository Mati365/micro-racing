import {removeNullValues} from '@pkg/basic-helpers';
import {
  createVertexBuffer,
  createIndexBuffer,
} from '../buffer/types';

/**
 * Creates information about mesh, allocates buffers and other stuff
 *
 * @param {WebGLRenderingContext} gl
 * @param {FGLContext} fglContext
 *
 * @returns {MeshInfo}
 */
const createMeshDescriptor = gl => ({
  // shaders
  material,

  // attribs
  uv,
  vertices,
  indices,
  buffers,

  // gl low level flags
  renderMode = gl.TRIANGLE_STRIP,
  usage = gl.STATIC_DRAW,

  // other flags such as {attributes, uniforms}
  ...options
}) => Object.freeze(
  {
    material,
    renderMode,

    uv: uv && createVertexBuffer(gl, uv, usage, 2),
    vbo: vertices && createVertexBuffer(gl, vertices, usage),
    ibo: indices && createIndexBuffer(gl, indices, usage),

    buffers: removeNullValues(buffers),
    ...options,
  },
);

export default createMeshDescriptor;
