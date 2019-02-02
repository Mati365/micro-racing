import * as R from 'ramda';

/**
 * Creates a function that maps over all shader parameters
 *
 * @see {@link https://stackoverflow.com/a/12610969}
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 *
 * @returns {Object}
 */
export const pickProgramParameters = ({
  glMapper,
  glFlag,
}) => (gl, program) => {
  const mapperFn = ::gl[glMapper];
  const count = gl.getProgramParameter(program, gl[glFlag]);

  const attributes = R.times(
    R.compose(
      R.pick([
        'type', 'size', 'name',
      ]),
      index => mapperFn(program, index),
    ),
    count,
  );

  return R.reduce(
    (prev, {name, ...item}) => ({
      ...prev,
      [name]: item,
    }),
    {},
    attributes,
  );
};

/**
 * Loads object of uniforms
 *
 * @export
 */
export const pickProgramUniforms = pickProgramParameters(
  {
    glFlag: 'ACTIVE_UNIFORMS',
    glMapper: 'getActiveUniform',
  },
);

/**
 * Loads object of attributes
 *
 * @export
 */
export const pickProgramAttributes = pickProgramParameters(
  {
    glFlag: 'ACTIVE_ATTRIBUTES',
    glMapper: 'getActiveAttrib',
  },
);
