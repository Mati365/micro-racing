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
    const {material} = createContextDescriptor(description);

    // mesh render method
    return (uniforms) => {
      // attach shader
      material.attach();
      uniforms && material.setUniforms(uniforms);

      // todo: render
    };
  };
};

export default createMesh;
