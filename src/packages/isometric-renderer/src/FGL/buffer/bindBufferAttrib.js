/**
 * @param {WebGLRenderingContext} gl
 * @param {BufferDescriptor} bufferDescriptor
 * @param {Number} attribLoc
 */
const bindBufferAttrib = (gl, bufferDescriptor, attribLoc) => {
  const {
    type,
    handle,
    components,
  } = bufferDescriptor;

  gl.bindBuffer(type, handle);
  gl.vertexAttribPointer(attribLoc, components.singleLength, components.type, false, 0, 0);
  gl.enableVertexAttribArray(attribLoc);
};

export default bindBufferAttrib;
