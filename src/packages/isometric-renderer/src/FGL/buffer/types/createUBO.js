import createBuffer from '../createBuffer';

const createUBO = (gl, config) => createBuffer(
  gl,
  {
    type: gl.UNIFORM_BUFFER,
    usage: gl.STATIC_DRAW,
    ...config,
  },
);

export default createUBO;
