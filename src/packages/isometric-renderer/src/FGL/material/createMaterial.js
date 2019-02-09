import * as R from 'ramda';

import createMaterialDescriptor from './createMaterialDescriptor';

/**
 * Maps uniform gl constant to setter
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getActiveUniform}
 *
 * @todo
 *  Add support for UBO(Uniform Buffer Object)
 */
const createGLSLUniformSetterMap = gl => ({
  [gl.FLOAT]: loc => value => gl.uniform1f(loc, value),
  [gl.FLOAT_VEC2]: loc => array => gl.uniform2fv(loc, array),
  [gl.FLOAT_VEC3]: loc => array => gl.uniform3fv(loc, array),
  [gl.FLOAT_VEC4]: loc => array => gl.uniform4fv(loc, array),

  [gl.INT]: loc => value => gl.uniform1i(loc, value),
  [gl.INT_VEC2]: loc => array => gl.uniform2iv(loc, array),
  [gl.INT_VEC3]: loc => array => gl.uniform3iv(loc, array),
  [gl.INT_VEC4]: loc => array => gl.uniform4iv(loc, array),

  [gl.FLOAT_MAT2]: loc => array => gl.uniformMatrix2fv(loc, false, array),
  [gl.FLOAT_MAT3]: loc => array => gl.uniformMatrix3fv(loc, false, array),
  [gl.FLOAT_MAT4]: loc => array => gl.uniformMatrix4fv(loc, false, array),
});

/**
 * Creates predefined uniform object
 *
 * @param {WebGLRenderingContext} gl
 */
const createMaterialUniformSetters = (gl) => {
  const uniformGLSLSetters = createGLSLUniformSetterMap(gl);

  return materialUniforms => R.mapObjIndexed(
    ({type, loc}) => uniformGLSLSetters[type](loc),
    materialUniforms,
  );
};

/**
 *@todo
*  Maybe there will be used any non shader material?
*  For example for lighting etc?
*
* @param {WebGLRenderingContext} gl
* @param {FGL} fgl

* @param {Object} description
*/
const createMaterial = (gl, fgl) => {
  const createContextDescriptor = createMaterialDescriptor(gl);
  const createContextUniformSetters = createMaterialUniformSetters(gl);

  return (description) => {
    const {state: fglState} = fgl;

    const material = createContextDescriptor(description);
    const materialUniformSetters = createContextUniformSetters(material.uniforms);
    const {
      uuid,
      program,
    } = material;

    /**
     * Loads material to GL context
     *
     * @returns {Boolean} false if already loaded
     */
    const attachMaterial = () => {
      // do not attach again material
      // attaching shaders is very expensive
      if (uuid === fglState.materialUUID)
        return false;

      // mount GL shader
      gl.useProgram(program);
      return true;
    };

    /**
     * Loads uniform into program
     *
     * @todo
     *  Optimize, add unrolling?
     */
    const setMaterialUniforms = (uniforms) => {
      for (const key in uniforms) {
        if (Object.prototype.hasOwnProperty.call(uniforms, key)) {
          const setter = materialUniformSetters[key];

          if (!setter)
            return;

          // set uniform
          setter(uniforms[key]);
        }
      }
    };

    return {
      info: material,
      attach: attachMaterial,
      setUniforms: setMaterialUniforms,
    };
  };
};

export default createMaterial;
