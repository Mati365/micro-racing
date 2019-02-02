import createMaterialDescriptor from './createMaterialDescriptor';

/**
 *@todo
*  Maybe there will be used any non shader material?
*  For example for lighting etc?
*
* @param {WebGLRenderingContext} gl
* @param {Object} description
 */
const createMaterial = (gl) => {
  const createContextMaterialDescriptor = createMaterialDescriptor(gl);

  return (description) => {
    const descriptor = createContextMaterialDescriptor(description);

    /**
     * @see
     *  Loads material to GL context
     */
    const attachMaterial = () => {};

    /**
     * @see
     *  Removes material from GL context
     */
    const detachMaterial = () => {};

    return {
      descriptor,

      attach: attachMaterial,
      detach: detachMaterial,
    };
  };
};

export default createMaterial;
