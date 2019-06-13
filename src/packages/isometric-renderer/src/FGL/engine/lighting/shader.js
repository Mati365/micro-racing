import {vec3} from '@pkg/gl-math';
import {
  toGLSLTypeDef,
  createPackedStruct,
} from '@pkg/struct-pack';

import {glsl} from '../../core/material/types';

export const MAX_LIGHTS_COUNT = 8;

/**
 * Light types
 */
export const LIGHT_TYPES = {
  POINT: 1,
  SPOTLIGHT: 2,
};

export const Light = createPackedStruct(
  {
    fields: {
      pos: 'vec3',
      ambientColor: {
        type: 'vec3',
        default: vec3(1.0, 1.0, 1.0),
      },
      diffuseColor: {
        type: 'vec3',
        default: vec3(1.0, 1.0, 1.0),
      },
      specularColor: {
        type: 'vec3',
        default: vec3(1.0, 1.0, 1.0),
      },

      ambientIntensity: 'float',
      diffuseIntensity: 'float',
      specularIntensity: 'float',

      type: {
        type: 'float',
        default: LIGHT_TYPES.POINT,
      },


      // for directional ligth
      direction: 'vec3',
      cutOff: 'float',
      outerCutOff: 'float',
    },
  },
);

export const LightsBlock = createPackedStruct(
  {
    defs: {
      Light,
    },
    fields: {
      lights: `Light[${MAX_LIGHTS_COUNT}]`,
      lightsCount: 'float',
    },
  },
);

export const calcLightingFragment = glsl`
  uniform bool lighting;

  struct Light {
    ${toGLSLTypeDef(Light)}
  };

  layout(std140) uniform lightsBlock {
    ${toGLSLTypeDef(LightsBlock)}
  };

  vec3 calcLighting(vec3 normal, vec3 vPos) {
    if (!lighting)
      return vec3(1.0);

    vec3 color = vec3(0.0);
    vec3 normalizedNormal = normalize(normal);

    for (int i = int(lightsCount) - 1; i >= 0; --i) {
      Light light = lights[i];
      int type = int(light.type);

      vec3 lightVector = normalize(light.pos - vPos);
      vec3 diffuse = light.diffuseColor * clamp(
        dot(normalizedNormal, lightVector) * light.diffuseIntensity,
        0.0,
        1.0
      );

      switch (type) {
        // POINT LIGHT
        case ${LIGHT_TYPES.POINT}:
          color += diffuse;
          break;

        // SPOTLIGHT
        case ${LIGHT_TYPES.SPOTLIGHT}:
          float theta = dot(-light.direction, lightVector);

          if (theta >= light.cutOff) {
            float epsilon = light.outerCutOff - light.cutOff;
            float intensity = clamp(
              (theta - light.cutOff) / epsilon,
              0.0, 1.0
            );

            color += diffuse * intensity;
          }
          break;
      }
    }

    return color;
  }
`;
