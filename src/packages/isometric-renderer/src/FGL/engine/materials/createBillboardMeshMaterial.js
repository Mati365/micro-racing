import * as R from 'ramda';

import {vec3} from '@pkg/gl-math';

import {glsl} from '../../core/material/types';
import {calcLightingFragment} from '../lighting';

const createBillboardMeshMaterial = fgl => (normalDir = vec3(0, 0, -1)) => fgl.material.shader(
  {
    shaders: {
      vertex: glsl`
        in vec4 inVertexPos;
        in vec2 inUVPos;

        out vec2 vUVPos;
        out vec3 vPos;
        out vec3 vNormal;

        uniform mat4 mpMatrix;
        uniform mat4 mMatrix;

        const vec3 normal = vec3(${R.join(',', normalDir)});

        void main() {
          gl_Position = inVertexPos * mpMatrix;

          vUVPos = inUVPos;
          vPos = vec3(inVertexPos * mMatrix);
          vNormal = normal;
        }
      `,

      fragment: glsl`
        in vec2 vUVPos;
        in vec3 vPos;
        in vec3 vNormal;

        out vec4 fragColor;

        uniform vec4 color;
        uniform sampler2D tex0;

        ${calcLightingFragment}

        void main() {
          fragColor = color * texture(tex0, vUVPos) * vec4(calcLighting(vNormal, vPos), 1.0);
        }
      `,
    },
  },
);

export default createBillboardMeshMaterial;
