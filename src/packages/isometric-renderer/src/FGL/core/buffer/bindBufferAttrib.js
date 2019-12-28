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
    vertexAttribDivisor,
  } = bufferDescriptor;

  gl.bindBuffer(type, handle);

  if (components.singleLength) {
    gl.vertexAttribPointer(attribLoc, components.singleLength, components.type, false, 0, 0);
    gl.enableVertexAttribArray(attribLoc);
  }

  if (vertexAttribDivisor)
    gl.vertexAttribDivisor(attribLoc, vertexAttribDivisor);
};

export const unbindBufferAttrib = (gl, bufferDescriptor, attribLoc) => {
  const {type} = bufferDescriptor;

  gl.vertexAttribDivisor(attribLoc, null);
  gl.disableVertexAttribArray(attribLoc);
  gl.bindBuffer(type, null);
};

export default bindBufferAttrib;
