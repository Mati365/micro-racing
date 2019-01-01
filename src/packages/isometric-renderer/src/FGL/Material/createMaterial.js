import * as R from 'ramda';

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

  return R.when(
    R.is(Object),
    R.mapObjIndexed(
      (uniform, key) => ({
        ...uniform,
        loc: getLocationFn(program, key),
      }),
    ),
  );
};

const glUniformLocationMapper = glLocationMapper('getUniformLocation');
const glAttribLocationMapper = glLocationMapper('getAttribLocation');

/**
 * @param {WebGLRenderingContext} gl
 *
 * @export
 */
const createMaterial = gl => ({
  program,
  uniforms,
}) => ({
  program,
  uniforms: glUniformLocationMapper(gl, program)(uniforms),
  attributes: glAttribLocationMapper(gl, program)(uniforms),
});

export default createMaterial;
