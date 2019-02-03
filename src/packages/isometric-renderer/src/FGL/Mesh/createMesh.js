import createMeshDescriptor from './createMeshDescriptor';

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
      buffers,
      material,
    } = createContextDescriptor(description);

    const {loc: vboLoc} = material.info.attributes.inVertexPos;

    // mesh render method
    return (config) => {
      // VBO bind
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vbo);
      gl.vertexAttribPointer(vboLoc, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vboLoc);

      // attach shader
      material.attach();

      // each mesh can accept parameters
      if (config) {
        const {uniforms} = config;
        if (uniforms)
          material.setUniforms(uniforms);
      }

      // Render
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
      gl.disableVertexAttribArray(vboLoc);
    };
  };
};

export default createMesh;
