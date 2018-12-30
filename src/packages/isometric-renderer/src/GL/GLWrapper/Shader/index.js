import {alwaysThrow} from '@pkg/basic-helpers';

/**
 * @export
 * @class
 */
export default class Shader {
  constructor({
    name = alwaysThrow('Shader name is required!'),
    uniforms,
    vertexShader,
    fragmentShader,
  }) {
    this.name = name;
    this.uniforms = uniforms;
    this.shaders = {
      vertex: vertexShader,
      fragment: fragmentShader,
    };
  }
}
