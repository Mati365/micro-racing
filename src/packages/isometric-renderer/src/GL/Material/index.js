import {alwaysThrow} from '@pkg/basic-helpers';

/**
 * @export
 * @class
 */
export default class Material {
  constructor({
    uuid = alwaysThrow('Material UUID is required!'),
    uniforms,
    vertexShader,
    fragmentShader,
  }) {
    this.uuid = uuid;
    this.uniforms = uniforms;
    this.shaders = {
      vertex: vertexShader,
      fragment: fragmentShader,
    };
  }
}
