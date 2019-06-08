import {glsl} from '../../material/types';
import basicDiffuseLight from './glsl/basicDiffuseLight';

export const MAX_MATERIALS_COUNT = 4;

export const MATERIAL_STRUCT_SIZEOF = 64;

export const packMaterialsBuffer = (materials) => {
  const buffer = new Float32Array(MAX_MATERIALS_COUNT * MATERIAL_STRUCT_SIZEOF);
  const count = Math.min(MAX_MATERIALS_COUNT, materials.length);

  for (let i = 0, offset = 0; i < count; ++i, offset += MATERIAL_STRUCT_SIZEOF / 4) {
    const {
      ambient, diffuse, specular,
      transparent, shine,
    } = materials[i];

    buffer.set(ambient, offset);
    buffer.set(diffuse, offset + 4);
    buffer.set(specular, offset + 8);
    buffer.set([transparent, shine], offset + 12);
  }

  return buffer;
};

const createTextureSpriteMaterial = fgl => fgl.material.shader(
  {
    shaders: {
      vertex: glsl`
        layout(location = 0) in vec3 position;
        layout(location = 1) in vec3 normal;
        layout(location = 2) in vec2 uv;
        layout(location = 3) in float mtl;

        uniform mat4 mMatrix;
        uniform mat4 mpMatrix;

        out vec2 vUVPos;
        out vec4 vLight;

        flat out float mtlIndexF;

        ${basicDiffuseLight}

        void main() {
          vec4 castedPos = vec4(position, 1.0);

          gl_Position = castedPos * mpMatrix;
          vUVPos = uv;
          mtlIndexF = mtl;

          // lighting
          vec3 lightPos = vec3(0, 0, 0.0);
          vec3 modelVertexPos = vec3(castedPos * mMatrix);

          vLight = calcDiffuseLight(
            lightPos - modelVertexPos, // light vector
            normal * inverse(transpose(mat3(mMatrix))), // rotated normal
            1.0 // intense
          );
        }
      `,

      fragment: glsl`
        #define MAX_MATERIALS_COUNT ${MAX_MATERIALS_COUNT}

        in vec2 vUVPos;
        in vec4 vLight;
        flat in float mtlIndexF;

        out vec4 fragColor;

        struct Material {
          vec4 ambient; // 12B + 4B unused, offset: 0
          vec4 diffuse; // 12B + 4B unused, offset: 16,
          vec4 specular; // 12B + 4B unused, offset: 32
          float transparent; // 4B, offset: 48,
          float shine; // 4B, offset: 52,
          // +8B unused
        };

        uniform bool textured;
        uniform sampler2D tex0;

        layout(std140) uniform materialsBlock {
          Material materials[MAX_MATERIALS_COUNT];
        };

        void main() {
          vec4 color;
          int mtlIndex = int(mtlIndexF);

          if (mtlIndex != -1) {
            Material mtl = materials[mtlIndex];
            color = mtl.ambient * mtl.diffuse;
          } else
            color = vec4(1.0, 1.0, 1.0, 1.0);

          if (textured)
            color *= texture(tex0, vUVPos);

          fragColor = color * vLight;
        }
      `,
    },
  },
);

export default createTextureSpriteMaterial;
