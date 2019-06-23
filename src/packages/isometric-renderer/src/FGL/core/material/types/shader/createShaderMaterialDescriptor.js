import * as R from 'ramda';
import {
  createProgram,
  compileShader,

  pickProgramUniforms,
  pickProgramAttributes,
  pickProgramUniformBlocks,
} from './utils';

/**
 * Assign to each object selector specified in selectors object
 *
 * @param {Object} selectors
 */
const assignObjectSelectors = selectors => (obj) => {
  if (!selectors || !obj)
    return obj;

  return R.mapObjIndexed(
    (value, key) => ({
      ...value,
      selector: selectors[key] || key,
    }),
    obj,
  );
};

/**
 * Function that creates object containing information about material,
 * shaders, attributes and others
 *
 * @todo
 *  Maybe there will be used any non shader material?
 *  For example for lighting etc?
 *
 * @param {WebGLRenderingContext} gl
 * @param {{shaders: {vertex, fragment}, uniforms}} config
 *
 * @example
 *  {
 *    uuid,
 *    program
 *    attributes: {attrib1: 'mat3'},
 *    uniforms:   {uniform2: R.prop('mat4')}
 *  }
 *
 * @export
 */
const createMaterialDescriptor = (gl) => {
  // counter is used to identify material in for example
  // render loop, it prevents expensive shader switching
  // if bunch of meshes use the same
  let uuidCounter = 0;

  return ({
    shaders: {
      vertex,
      fragment,
    },
    attributes,
    uniforms,
    ubo,
  }) => {
    const compiler = compileShader(gl);
    const program = createProgram(
      gl,
      [
        vertex && compiler(
          {
            type: gl.VERTEX_SHADER,
            precision: 'lowp',
            source: vertex,
          },
        ),

        fragment && compiler(
          {
            type: gl.FRAGMENT_SHADER,
            precision: 'mediump',
            source: fragment,
          },
        ),
      ],
    );

    return program && {
      uuid: uuidCounter++,
      program,

      // in/out shader attributes
      attributes: R.compose(
        assignObjectSelectors(attributes),
        pickProgramAttributes,
      )(gl, program),

      // shader uniforms
      uniforms: R.compose(
        assignObjectSelectors(uniforms),
        pickProgramUniforms,
      )(gl, program),

      // shader uniforms
      ubo: R.compose(
        assignObjectSelectors(ubo),
        pickProgramUniformBlocks,
      )(gl, program),
    };
  };
};

export default createMaterialDescriptor;
