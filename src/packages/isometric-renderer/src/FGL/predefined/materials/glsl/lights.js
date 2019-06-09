import * as R from 'ramda';
import {vec3} from '@pkg/gl-math';

import {glsl} from '../../../material/types';
import createUBO from '../../../buffer/types/createUBO';

export const MAX_LIGHTS_COUNT = 8;

export const LIGHT_STRUCT_SIZEOF = 80;

export const LIGHTS_STRUCT_ARRAY_SIZEOF = LIGHT_STRUCT_SIZEOF * MAX_LIGHTS_COUNT;

export const LIGHTS_UBO_SIZEOF = LIGHTS_STRUCT_ARRAY_SIZEOF + 16; // + 16 is lightsCount

/**
 * Light types
 */
export const LIGHT_TYPES = {
  POINT: 1,
};

export class Light {
  constructor({
    pos,
    type = LIGHT_TYPES.POINT,
    ambientColor = vec3(1.0, 1.0, 1.0),
    diffuseColor = vec3(1.0, 1.0, 1.0),
    specularColor = vec3(1.0, 1.0, 1.0),

    ambientIntensity = 1.0,
    diffuseIntensity = 1.0,
    specularIntensity = 1.0,
  }) {
    this.pos = pos;
    this.type = type;

    this.ambientColor = ambientColor;
    this.diffuseColor = diffuseColor;
    this.specularColor = specularColor;

    this.ambientIntensity = ambientIntensity;
    this.diffuseIntensity = diffuseIntensity;
    this.specularIntensity = specularIntensity;
  }
}

/**
 * Abstraction layer between Float32Array
 */
export class LightsSceneManager {
  constructor({
    list = [],
    f,
  }) {
    this.buffer = new Float32Array(LIGHTS_UBO_SIZEOF / 4);
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
    const offset = index * LIGHT_STRUCT_SIZEOF / 4;

    const {buffer} = this;
    const {
      pos, type,
      diffuseColor, diffuseIntensity,

      // todo:
      // ambientColor, specularColor,
      // ambientIntensity, specularIntensity,
    } = light;

    buffer.set(pos, offset); // pos
    buffer.set(diffuseColor, offset + 8);
    buffer[offset + 16] = diffuseIntensity;
    buffer[offset + 19] = type;

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
    const offset = LIGHTS_STRUCT_ARRAY_SIZEOF / 4;
    const {length} = this.lights;

    this.buffer[offset] = length;
    if (updateUBO)
      this.ubo.update(offset, new Float32Array([length]), offset, 1);
  }

  flushUBO() {
    const {ubo, buffer} = this;
    if (!ubo)
      return;

    this.flushLightsCount(false);
    ubo.update(0, buffer, 0, LIGHTS_UBO_SIZEOF / 4);
  }
}

/**
 * GLSL shader code
 */
export const calcLightingFragment = glsl`
  uniform bool lighting;

  struct Light {
    vec3 pos;           // offset - 0B
    vec3 ambientColor;  // offset - 16B
    vec3 diffuseColor;  // offset - 32B
    vec3 specularColor; // offset - 48B
    float ambientIntensity; // offset - 60B, fill missing byte in specularColor
    float diffuseIntensity; // offset - 64B
    float specularIntensity;  // offset - 68B
    float type; // offset - 72B
  }; // 76B + 4B unused

  layout(std140) uniform lightsBlock {
    Light lights[${MAX_LIGHTS_COUNT}]; // LIGHT_STRUCT_SIZEOF * LIGHTS_COUNT
    float lightsCount; // 4B + 12B unused, maybe cast to int fix: Float32Array passing
  };

  vec3 calcLighting(vec3 normal, vec3 vPos) {
    if (!lighting)
      return vec3(1.0);

    vec3 color = vec3(0.0);
    vec3 normalizedNormal = normalize(normal);

    for (int i = int(lightsCount) - 1; i >= 0; --i) {
      Light light = lights[i];
      vec3 lightVector = normalize(light.pos - vPos);

      vec3 diffuse = light.diffuseColor * clamp(
        dot(normalizedNormal, lightVector) * light.diffuseIntensity,
        0.0,
        1.0
      );

      color += diffuse;
    }

    return color;
  }
`;
