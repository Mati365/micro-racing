import createMeshDescriptor from './createMeshDescriptor';

/**
 * Creates renderable mesh instance
 *
 * @param {WebGLRenderingContext} gl
 * @param {FGLContext} fglContext
 */
const createMesh = () => (description) => {
  const {material} = createMeshDescriptor(description);

  // mesh render method
  return () => {
    material.attach();
  };
};

export default createMesh;
