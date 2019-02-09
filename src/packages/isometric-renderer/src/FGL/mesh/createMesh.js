import createMeshDescriptor from './createMeshDescriptor';

/**
 * @param {WebGLRenderingContext} gl
 * @param {BufferDescriptor} bufferDescriptor
 * @param {Number} attribLoc
 */
const bindBufferAttrib = (gl, bufferDescriptor, attribLoc) => {
  const {
    type,
    handle,
    components,
  } = bufferDescriptor;

  gl.bindBuffer(type, handle);
  gl.vertexAttribPointer(attribLoc, components.singleLength, components.type, false, 0, 0);
  gl.enableVertexAttribArray(attribLoc);
};

/**
 * Creates renderable mesh instance
 *
 * @param {WebGLRenderingContext} gl
 * @param {FGLContext} fglContext
 *
 * @returns {Function}
 */
const createMesh = (gl) => {
  const createContextDescriptor = createMeshDescriptor(gl);

  return (description) => {
    const {
      buffers: {
        vbo,
        ibo,
      },
      material,
      renderMode,
    } = createContextDescriptor(description);

    // cached buffer attrib locations
    const {loc: vboLoc} = material.info.attributes.inVertexPos;

    // mesh render method
    return (config) => {
      // VBO bind
      bindBufferAttrib(gl, vbo, vboLoc);

      // IBO bind
      if (ibo)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo.handle);

      // attach shader
      material.attach();

      // each mesh can accept parameters
      if (config) {
        const {uniforms} = config;
        if (uniforms)
          material.setUniforms(uniforms);
      }

      // Render
      if (ibo) {
        const {
          type: componentsType,
          count: verticesCount,
        } = ibo.components;

        gl.drawElements(renderMode, verticesCount, componentsType, 0);
      } else {
        const {count: verticesCount} = vbo.components;

        gl.drawArrays(renderMode, 0, verticesCount);
      }

      // disable VBO
      gl.disableVertexAttribArray(vboLoc);
    };
  };
};

export default createMesh;
