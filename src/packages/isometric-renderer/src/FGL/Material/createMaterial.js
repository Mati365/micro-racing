import createMaterialDescriptor from './createMaterialDescriptor';

/**
 *@todo
*  Maybe there will be used any non shader material?
*  For example for lighting etc?
*
* @param {WebGLRenderingContext} gl
* @param {FGLContext} fglContext
* @param {Object} description
*/
const createMaterial = (gl, fglContext = {}) => {
  const createContextMaterialDescriptor = createMaterialDescriptor(gl);

  return (description) => {
    const material = createContextMaterialDescriptor(description);

    // hashmap lookup cache for JS engine, do not
    // read uuid property every call of material in
    // attachMaterial call, it should be faster
    const {
      uuid,
      program,
    } = material;

    /**
     * @see
     *  Loads material to GL context
     */
    const attachMaterial = () => {
      // do not attach again material
      // attaching shaders is very expensive
      if (uuid !== fglContext.materialUUID)
        return;

      // mount GL shader
      gl.useProgram(program);
    };

    return {
      info: material,
      attach: attachMaterial,
    };
  };
};

export default createMaterial;
