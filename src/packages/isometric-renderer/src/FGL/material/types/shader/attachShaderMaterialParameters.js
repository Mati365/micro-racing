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
  },
) => {
  if (uniforms)
    material.setUniforms(uniforms);

  if (textures)
    material.setTextures(textures);
};

export default attachShaderMaterialParameters;
