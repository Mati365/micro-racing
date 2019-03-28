import {
  IN_UV_POS_ATTRIB,
  IN_VERTEX_POS_ATTRIB,
} from '../constants/predefinedShaderParams';

import attachShaderMaterialParameters from './utils/attachShaderMaterialParameters';
import createMeshDescriptor from './createMeshDescriptor';
import bindBufferAttrib from '../buffer/bindBufferAttrib';

/**
 * Do not use factory object, it consumes too much memory
 *
 * @export
 */
export class MeshRenderer {
  constructor(gl, meshDescriptor) {
    this.gl = gl;
    this.meshDescriptor = meshDescriptor;
  }

  /**
   * @export
   */
  attachBuffers() {
    const {
      meshDescriptor,
      gl,
    } = this;

    const {
      vbo,
      ibo,
      uv,
      material,
    } = meshDescriptor;

    const {attributes} = material.info;

    // attach shader
    material.attach();

    // VBO bind
    const {loc: vertexBufferLoc} = attributes[IN_VERTEX_POS_ATTRIB];
    bindBufferAttrib(gl, vbo, vertexBufferLoc);

    // texture UV
    if (uv) {
      const {loc: uvBufferLoc} = attributes[IN_UV_POS_ATTRIB];
      bindBufferAttrib(gl, uv, uvBufferLoc);
    }

    // IBO bind
    if (ibo)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo.handle);

    // each mesh can accept parameters
    // from dynamic render function call and default
    // parameters from config
    attachShaderMaterialParameters(material, meshDescriptor);
  }

  /**
   * Render bound to mesh material buffer
   *
   * @param {Number} instances
   */
  drawVertexBuffer(instances) {
    const {
      meshDescriptor,
      gl,
    } = this;

    const {
      vbo,
      ibo,
      renderMode,
    } = meshDescriptor;

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
  }

  /**
   * @param {Object} dynamicDescriptor
   */
  render(dynamicDescriptor) {
    this.attachBuffers();

    // it should be a bit faster than two comparators
    if (dynamicDescriptor) {
      const {material} = this.meshDescriptor;

      attachShaderMaterialParameters(material, dynamicDescriptor);
      this.drawVertexBuffer(dynamicDescriptor.instances);
    } else
      this.drawVertexBuffer();
  }
}

/**
 * Creates renderable mesh instance
 *
 * @param {WebGLRenderingContext} gl
 * @param {FGLContext} fglContext
 *
 * @returns {Function}
 */
const createMesh = gl => (description) => {
  const mesh = new MeshRenderer(gl, createMeshDescriptor(gl)(description));
  const renderer = mesh.render.bind(mesh);
  renderer.instance = mesh;
  return renderer;
};

export default createMesh;
