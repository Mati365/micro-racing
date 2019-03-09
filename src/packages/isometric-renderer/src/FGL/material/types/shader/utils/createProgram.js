import * as R from 'ramda';

/**
 * Creates GL shader program from list of shaders
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader[]} shaders
 *
 * @returns {WebGLProgram}
 */
const createProgram = (gl, shaders) => {
  const program = gl.createProgram();

  R.forEach(
    (shader) => {
      shader && gl.attachShader(program, shader);
    },
    shaders,
  );

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`Unable to link shader program! ${gl.getProgramInfoLog(program)}`);
    return null;
  }

  return program;
};

export default createProgram;
