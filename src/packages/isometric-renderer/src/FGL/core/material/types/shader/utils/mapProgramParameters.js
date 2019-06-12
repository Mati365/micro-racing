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
  glMapperFn,
  glFlag,
}) => (gl, program) => {
  const count = gl.getProgramParameter(program, gl[glFlag]);
  const attributes = R.times(
    index => glMapperFn(gl, program, index),
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
 * WebGL returns some prototype fields and other stuff,
 * we dont need it - it will be better to clone it as basic
 * JS object with some fields
 */
const pickBasicParameterProps = R.ifElse(
  R.is(String),
  R.objOf('name'),
  R.pick(
    [
      'type', 'size', 'name',
    ],
  ),
);

/**
 * Creates a mapper fn that picks info about type,
 * loc, size etc uniform / attribute into plain JS object
 *
 * @param {Object}  config
 */
const locationVariableMapper = (
  {
    glInfoMethod,
    glLocationMethod,
  },
) => (gl, program, index) => {
  const variableInfo = glInfoMethod && pickBasicParameterProps(
    ::gl[glInfoMethod](program, index),
  );

  return {
    ...variableInfo,
    loc: ::gl[glLocationMethod](program, variableInfo.name),
  };
};

/**
 * Loads object of uniforms
 *
 * @export
 */
export const pickProgramUniforms = pickProgramParameters(
  {
    glFlag: 'ACTIVE_UNIFORMS',
    glMapperFn: locationVariableMapper(
      {
        glInfoMethod: 'getActiveUniform',
        glLocationMethod: 'getUniformLocation',
      },
    ),
  },
);

/**
 * Loads object of uniforms
 *
 * @export
 */
export const pickProgramUniformBlocks = pickProgramParameters(
  {
    glFlag: 'ACTIVE_UNIFORM_BLOCKS',
    glMapperFn: locationVariableMapper(
      {
        glInfoMethod: 'getActiveUniformBlockName',
        glLocationMethod: 'getUniformBlockIndex',
      },
    ),
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
    glMapperFn: locationVariableMapper(
      {
        glInfoMethod: 'getActiveAttrib',
        glLocationMethod: 'getAttribLocation',
      },
    ),
  },
);
