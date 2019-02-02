import createMaterialDescriptor from './createMaterialDescriptor';

/**
 * Maps uniform gl constant to setter
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getActiveUniform}
 */
const createUniformSetterMap = gl => ({
  [gl.FLOAT]: 'uniform1f',
  [gl.FLOAT_VEC2]: 'uniform2fv',
  [gl.FLOAT_VEC3]: 'uniform3fv',
  [gl.FLOAT_VEC4]: 'uniform4fv',

  [gl.INT]: 'uniform1i',
  [gl.INT_VEC2]: 'uniform2iv',
  [gl.INT_VEC3]: 'uniform3iv',
  [gl.INT_VEC4]: 'uniform4iv',

  [gl.BOOL]: 'uniform1i',
  [gl.BOOL_VEC2]: 'uniform2iv',
  [gl.BOOL_VEC3]: 'uniform3iv',
  [gl.BOOL_VEC4]: 'uniform4iv',

  [gl.FLOAT_MAT2]: 'uniformMatrix2fv',
  [gl.FLOAT_MAT3]: 'uniformMatrix3fv',
  [gl.FLOAT_MAT4]: 'uniformMatrix4fv',
});

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
  const map = createUniformSetterMap(gl);

  console.log(map);

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

    console.log(material);
    return {
      info: material,
      attach: attachMaterial,
    };
  };
};

export default createMaterial;
