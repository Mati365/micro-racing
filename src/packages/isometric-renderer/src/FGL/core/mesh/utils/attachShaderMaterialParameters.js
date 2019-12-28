/**
 * Attaches parameters from mesh descriptors passed
 * when mesh renders,
 *
 * @example
 *  mesh({uniforms: {}})
 *
 * @param {Material} material
 * @param {MeshDescriptor} descriptor
 */
const attachShaderMaterialParameters = (
  material,
  {
    uniforms,
    textures,
    buffers,
    ubo,
  },
) => {
  if (buffers)
    material.setAttributes(buffers);

  if (uniforms)
    material.setUniforms(uniforms);

  if (ubo)
    material.setUniformBuffers(ubo);

  if (textures)
    material.setTextures(textures);
};

export const detachShaderMaterialParameters = (
  material,
  {
    buffers,
  },
) => {
  if (buffers)
    material.setAttributes(buffers, true);
};

export default attachShaderMaterialParameters;
