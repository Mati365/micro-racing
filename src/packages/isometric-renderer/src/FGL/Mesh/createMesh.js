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
    return (config) => {
      // attach shader
      material.attach();

      // each mesh can accept parameters
      if (config) {
        const {uniforms} = config;
        if (uniforms)
          material.setUniforms(uniforms);

        // todo:
        //  add material uniforms selector iterator
        //  add unroll executor to them, for loop is slow
      }

      // todo: render
    };
  };
};

export default createMesh;
