/**
 * Compiles shader and return gl handle
 *
 * @param {WebGLRenderingContext} gl      GL handle
 * @param {Number} type    Shader type
 * @param {String} source  Shader source code
 *
 * @returns {WebGLShader}
 */
const compileShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`Cannot compile shader! ${gl.getShaderInfoLog(shader)}`);
    return null;
  }

  return shader;
};

export default compileShader;
