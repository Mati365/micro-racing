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
  gl.vertexAttribPointer(attribLoc, components.singleLength, components.type, false, 0, 0);
  if (vertexAttribDivisor)
    gl.vertexAttribDivisor(attribLoc, vertexAttribDivisor);

  gl.enableVertexAttribArray(attribLoc);
};

export default bindBufferAttrib;
