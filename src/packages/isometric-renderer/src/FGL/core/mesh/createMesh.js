import {
  IN_UV_POS_ATTRIB,
  IN_VERTEX_POS_ATTRIB,
} from '../constants/predefinedShaderParams';

import attachShaderMaterialParameters, {detachShaderMaterialParameters} from './utils/attachShaderMaterialParameters';
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

  release() {
    const {meshDescriptor} = this;

    meshDescriptor.release();
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
      vao,
      vbo,
      ibo,
      uv,
      material,
    } = meshDescriptor;

    const {attributes} = material.info;

    // attach shader
    material.attach();

    // VAO bind
    if (vao)
      gl.bindVertexArray(vao.handle);

    // VBO bind
    if (vbo) {
      const {loc: vertexBufferLoc} = attributes[IN_VERTEX_POS_ATTRIB];
      bindBufferAttrib(gl, vbo, vertexBufferLoc);
    }

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
      vao,
      ibo,
      renderMode,
      elementsCount,
    } = meshDescriptor;

    if (elementsCount === 0)
      return;

    if (ibo) {
      // Using indices buffer
      const {type: componentsType} = ibo.components;
      const verticesCount = elementsCount || ibo.components.count;

      if (instances)
        gl.drawElementsInstanced(renderMode, verticesCount, componentsType, 0, instances);
      else
        gl.drawElements(renderMode, verticesCount, componentsType, 0);
    } else {
      // Using only vertex buffer
      const verticesCount = elementsCount || (vbo || vao).components.count;

      // instanced rendering
      if (instances)
        gl.drawArraysInstanced(renderMode, 0, verticesCount, instances);
      else
        gl.drawArrays(renderMode, 0, verticesCount);
    }
  }

  /**
   * Cleanup VAOs and etc.
   */
  detachBuffers() {
    const {gl, meshDescriptor} = this;
    const {material, vao} = meshDescriptor;

    detachShaderMaterialParameters(material, meshDescriptor);
    if (vao)
      gl.bindVertexArray(null);
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

    this.detachBuffers();
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
  renderer.release = ::mesh.release;

  return renderer;
};

export default createMesh;
