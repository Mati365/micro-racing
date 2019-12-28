import * as R from 'ramda';

import {TEX_UNIFORM} from '../../../constants/predefinedShaderParams';
import createShaderMaterialDescriptor from './createShaderMaterialDescriptor';
import bindBufferAttrib, {unbindBufferAttrib} from '../../../buffer/bindBufferAttrib';

/**
 * Maps uniform gl constant to setter
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getActiveUniform}
 *
 * @param {WebGLRenderingContext} gl
 *
 * @todo
 *  Add support for UBO(Uniform Buffer Object)
 */
const createGLSLUniformSetterMap = gl => ({
  [gl.FLOAT]: loc => value => gl.uniform1f(loc, value),
  [gl.FLOAT_VEC2]: loc => array => gl.uniform2fv(loc, array),
  [gl.FLOAT_VEC3]: loc => array => gl.uniform3fv(loc, array),
  [gl.FLOAT_VEC4]: loc => array => gl.uniform4fv(loc, array),

  [gl.BOOL]: loc => value => gl.uniform1i(loc, value),
  [gl.INT]: loc => value => gl.uniform1i(loc, value),
  [gl.INT_VEC2]: loc => array => gl.uniform2iv(loc, array),
  [gl.INT_VEC3]: loc => array => gl.uniform3iv(loc, array),
  [gl.INT_VEC4]: loc => array => gl.uniform4iv(loc, array),

  [gl.FLOAT_MAT2]: loc => array => gl.uniformMatrix2fv(loc, false, array),
  [gl.FLOAT_MAT3]: loc => array => gl.uniformMatrix3fv(loc, false, array),
  [gl.FLOAT_MAT4]: loc => array => gl.uniformMatrix4fv(loc, false, array),

  [gl.SAMPLER_2D]: loc => value => gl.uniform1i(loc, value),
});

/**
 * Creates pair - GLenum -> uniformName for tex fields
 *
 * @param {WebGLRenderingContext} gl
 */
export const createGLSLTexUniforms = gl => [
  [gl.TEXTURE0, TEX_UNIFORM[0]],
  [gl.TEXTURE1, TEX_UNIFORM[1]],
  [gl.TEXTURE2, TEX_UNIFORM[2]],
];

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
 * @todo
 *  Maybe there will be used any non shader material?
 *  For example for lighting etc?
 *
 * @param {WebGLRenderingContext} gl
 * @param {FGL} fgl
 * @param {Object} description
 *
 * @example
 *  {
 *    info, // MaterialDescriptor
 *    attach(),
 *    setUniforms(),
 *    setTextures()
 *  }
 */
const createShaderMaterial = (gl, fgl) => {
  const createContextDescriptor = createShaderMaterialDescriptor(gl);
  const createContextUniformSetters = createMaterialUniformSetters(gl);
  const texSlotsIndices = createGLSLTexUniforms(gl);

  return (description) => {
    const {state: fglState} = fgl;

    const material = createContextDescriptor(description);
    const materialUniformSetters = createContextUniformSetters(material.uniforms || {});
    const {
      uuid,
      program,
    } = material;

    /**
     * Sets single uniform
     *
     * @param {String} key
     * @param {Any} value
     */
    const setMaterialUniform = (key, value) => {
      const setter = materialUniformSetters[key];
      if (!setter)
        return;

      // set uniform
      setter(value);
    };

    /**
     * Attaches array of textures to material
     *
     * @param {Array} textures
     */
    const setMaterialTextures = (textures) => {
      if (!textures || !textures.length)
        return;

      for (let i = 0; i < textures.length; ++i) {
        const [glTextureFlag, uniformName] = texSlotsIndices[i];

        gl.activeTexture(glTextureFlag);
        gl.bindTexture(gl.TEXTURE_2D, textures[i]);
        setMaterialUniform(uniformName, i);
      }
    };

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
      for (const key in uniforms)
        setMaterialUniform(key, uniforms[key]);
    };

    /**
     * Loads uniform buffers into program
     */
    R.forEachObjIndexed(
      ({loc}) => {
        gl.uniformBlockBinding(program, loc, loc);
      },
      material.ubo,
    );

    const setMaterialUniformBuffers = (ubo) => {
      for (const key in ubo) {
        const uboDescription = material.ubo[key];
        if (!uboDescription)
          continue;

        gl.bindBufferBase(
          gl.UNIFORM_BUFFER,
          uboDescription.loc,
          ubo[key].handle,
        );
      }
    };

    /**
     * Loads attributes object into mesh
     *
     * @param {Buffer} attributes
     */
    const setMaterialAttributes = (attributes, unbind = false) => {
      for (const key in attributes) {
        const attributeDescription = material.attributes[key];
        if (!attributeDescription)
          continue;

        if (unbind)
          unbindBufferAttrib(gl, attributes[key], attributeDescription.loc);
        else
          bindBufferAttrib(gl, attributes[key], attributeDescription.loc);
      }
    };

    return {
      info: material,
      attach: attachMaterial,

      setAttributes: setMaterialAttributes,
      setUniforms: setMaterialUniforms,
      setTextures: setMaterialTextures,
      setUniformBuffers: setMaterialUniformBuffers,
    };
  };
};

export default createShaderMaterial;
