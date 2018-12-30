/**
 * @export
 * @class
 */
export default class Shader {
  constructor({
    uniforms,
    vertexShader,
    fragmentShader,
  }) {
    this.uniforms = uniforms;
    this.shaders = {
      vertex: vertexShader,
      fragment: fragmentShader,
    };
  }
}
