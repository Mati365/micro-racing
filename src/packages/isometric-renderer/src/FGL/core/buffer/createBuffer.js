import * as R from 'ramda';

class BufferWrapper {
  constructor(gl, type, usage, handle, length) {
    this.gl = gl;
    this.type = type;
    this.usage = usage;
    this.handle = handle;
    this.length = length;
  }

  update(destOffset, src, srcOffset, length) {
    const {gl, type} = this;

    gl.bindBuffer(type, this.handle);
    gl.bufferSubData(type, destOffset, src, srcOffset, length);
    gl.bindBuffer(type, null);
  }

  release() {
    const {gl, handle} = this;

    gl.deleteBuffer(handle);
  }
}

/**
 * Creates OpenGL buffer
 *
 * @see
 *  {@link} https://wiki.delphigl.com/index.php/Tutorial_WebGL_Sample
 *  {@link} https://www.khronos.org/opengl/wiki/VBO_-_just_examples
 *
 * @param {WebGLRenderingContext} gl
 * @param {GLEnum} type
 * @param {GLEnum} usage
 * @param {Float32Array|WebGLUnsignedShortArray} data
 *
 * @returns {Number}
 */
const createBuffer = (
  gl,
  {
    type = gl.ARRAY_BUFFER,
    usage = gl.STATIC_DRAW,
    data,
    length,
  },
) => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(type, buffer);
  gl.bufferData(type, data, usage);
  gl.bindBuffer(type, null);

  return new BufferWrapper(
    gl,
    type,
    usage,
    buffer,
    length || data.length,
  );
};

export default R.curry(createBuffer);
