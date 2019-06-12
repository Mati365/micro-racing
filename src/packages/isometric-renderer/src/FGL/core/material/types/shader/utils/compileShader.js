/**
 * Compiles shader and return gl handle
 *
 * @see {@link https://stackoverflow.com/questions/13780609/what-does-precision-mediump-float-mean}
 *
 * @param {WebGLRenderingContext} gl      GL handle
 * @param {Number} type    Shader type
 * @param {String} source  Shader source code
 * @param {String} precision  Float calculation precision
 *
 * @returns {WebGLShader}
 */
const compileShader = gl => ({
  type,
  source,
  version = 300,
  precision = 'mediump',
}) => {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, `#version ${version} es\nprecision ${precision} float; ${source}`);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`Cannot compile shader! ${gl.getShaderInfoLog(shader)}`);
    return null;
  }

  return shader;
};

export default compileShader;
