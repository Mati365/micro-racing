import * as R from 'ramda';
import {
  createProgram,
  compileShader,
} from './Shader';

/**
 * Maps object of uniforms/attributes/etc GL stuff
 * and adds `loc` propety to every uniform
 *
 * @param {String} glMapperName
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 *
 * @returns {[name]: {loc, ...item}}
 */
const glLocationMapper = glMapperName => (gl, program) => {
  const getLocationFn = gl[glMapperName].bind(gl);

  return R.ifElse(
    R.is(Object),
    R.mapObjIndexed(
      (uniform, key) => ({
        ...uniform,
        loc: getLocationFn(program, key),
      }),
    ),
    R.always(null),
  );
};

const glUniformLocationMapper = glLocationMapper('getUniformLocation');
const glAttribLocationMapper = glLocationMapper('getAttribLocation');

/**
 * @todo
 *  Maybe there will be used any non shader material?
 *  For example for lighting etc?
 *
 * @param {WebGLRenderingContext} gl
 * @param {{shaders: {vertex, fragment}, uniforms}} config
 *
 * @export
 */
const createMaterial = gl => ({
  shaders: {
    vertex,
    fragment,
  },
  uniforms,
}) => {
  const program = createProgram(
    gl,
    [
      vertex && compileShader(gl, gl.VERTEX_SHADER, vertex),
      fragment && compileShader(gl, gl.FRAGMENT_SHADER, fragment),
    ],
  );

  return {
    program,
    uniforms: glUniformLocationMapper(gl, program)(uniforms),
    attributes: glAttribLocationMapper(gl, program)(uniforms),
  };
};

export default createMaterial;
