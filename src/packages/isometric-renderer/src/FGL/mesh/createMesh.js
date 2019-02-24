import {
  IN_UV_POS_ATTRIB,
  IN_VERTEX_POS_ATTRIB,
} from '../constants/predefinedShaderParams';

import attachShaderMaterialParameters from '../material/types/shader/attachShaderMaterialParameters';
import createMeshDescriptor from './createMeshDescriptor';
import bindBufferAttrib from '../buffer/bindBufferAttrib';

/**
 * Creates function that renders mesh based on config
 *
 * @param {WebGLRenderingContext} gl
 * @param {meshDescriptor} meshDescriptor
 *
 * @param {Object} dynamicDescriptor
 *
 * @returns {Function}
 */
const createMeshRenderer = (gl, meshDescriptor) => {
  const {
    buffers: {
      vbo,
      ibo,
      uv,
    },
    material,
    renderMode,
  } = meshDescriptor;

  // cached buffer attrib locations
  const {loc: vertexBufferLoc} = material.info.attributes[IN_VERTEX_POS_ATTRIB];
  const {loc: uvBufferLoc} = material.info.attributes[IN_UV_POS_ATTRIB] || {};

  /**
   * @see
   * Attaches material before render
   */
  const attachBuffers = () => {
    // attach shader
    material.attach();

    // VBO bind
    bindBufferAttrib(gl, vbo, vertexBufferLoc);

    // texture UV
    if (uv)
      bindBufferAttrib(gl, uv, uvBufferLoc);

    // IBO bind
    if (ibo)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo.handle);

    // each mesh can accept parameters
    // from dynamic render function call and default
    // parameters from config
    attachShaderMaterialParameters(material, meshDescriptor);
  };

  /**
   * @see
   * Disables buffers
   */
  const detachBuffers = () => {
    gl.disableVertexAttribArray(vertexBufferLoc);
  };

  /**
   * @see
   * Renders mesh
   */
  const drawVertexBuffer = (instances) => {
    if (ibo) {
      // Using indices buffer
      const {
        type: componentsType,
        count: verticesCount,
      } = ibo.components;

      if (instances)
        gl.drawElementsInstanced(renderMode, verticesCount, componentsType, 0, instances);
      else
        gl.drawElements(renderMode, verticesCount, componentsType, 0);
    } else {
      // Using only vertex buffer
      const {count: verticesCount} = vbo.components;

      // instanced rendering
      if (instances)
        gl.drawArraysInstanced(renderMode, 0, verticesCount, instances);
      else
        gl.drawArrays(renderMode, 0, verticesCount);
    }
  };

  // mesh render method
  const render = (dynamicDescriptor) => {
    attachBuffers();

    // it should be a bit faster than two comparators
    if (dynamicDescriptor) {
      attachShaderMaterialParameters(material, dynamicDescriptor);
      drawVertexBuffer(DynamicsCompressorNode.instances);
    } else
      drawVertexBuffer();

    detachBuffers();
  };

  Object.assign(
    render,
    {
      // variables
      meshDescriptor,

      // methods
      attachBuffers,
      detachBuffers,
      drawVertexBuffer,
    },
  );

  return render;
};

/**
 * Creates renderable mesh instance
 *
 * @param {WebGLRenderingContext} gl
 * @param {FGLContext} fglContext
 *
 * @returns {Function}
 */
const createMesh = gl => description => createMeshRenderer(
  gl,
  createMeshDescriptor(gl)(description),
);

export default createMesh;
