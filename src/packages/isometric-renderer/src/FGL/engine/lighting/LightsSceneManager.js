import * as R from 'ramda';

import createUBO from '../../core/buffer/types/createUBO';
import {
  LightsBlock,
  Light,
} from './shader';

const LIGHTS_UBO_SIZEOF = LightsBlock.binary.size / 4;

const LIGHT_STRUCT_SIZEOF = Light.binary.size / 4;

/**
 * Abstraction layer between Float32Array
 */
export default class LightsSceneManager {
  constructor({
    list = [],
    f,
  }) {
    this.buffer = new Float32Array(LIGHTS_UBO_SIZEOF);
    this.set(list);

    this.f = f;
    this.ubo = createUBO(
      f.state.gl,
      {
        data: this.buffer,
        usage: f.state.gl.DYNAMIC_DRAW,
      },
    );
  }

  get empty() {
    return !this.lights.length;
  }

  packBufferLight(light, index) {
    const offset = index * LIGHT_STRUCT_SIZEOF;
    const {buffer} = this;

    light.pack(buffer, offset);
    return offset;
  }

  append(light) {
    const {lights} = this;

    lights.push(light);

    this.packBufferLight(light, lights.length - 1);
    this.flushUBO();

    return this;
  }

  remove(light) {
    this.lights = R.without([light], this.lights);
    this.flushUBO();

    return this;
  }

  set(lights) {
    this.lights = lights;

    if (lights.length) {
      lights.map(::this.packBufferLight);
      this.flushUBO();
    }

    return this;
  }

  flushLightsCount(updateUBO = true) {
    const {length} = this.lights;
    const offset = LightsBlock.binary.offsets.lightsCount / 4;

    this.buffer[offset] = length;
    if (updateUBO)
      this.ubo.update(offset, new Float32Array([length]), offset, 1);
  }

  flushUBO() {
    const {ubo, buffer} = this;
    if (!ubo)
      return;

    this.flushLightsCount(false);
    ubo.update(0, buffer, 0, LIGHTS_UBO_SIZEOF);
  }
}
