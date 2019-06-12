import {glsl} from '../../material/types';
import {calcLightingFragment} from '../lighting';

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

        out vec2 vUVPos;
        out vec3 vPos;
        out vec3 vNormal;
        flat out float vMaterial;

        uniform mat3 invMMatrix;
        uniform mat4 mMatrix;
        uniform mat4 mpMatrix;

        void main() {
          vec4 castedPos = vec4(position, 1.0);

          gl_Position = castedPos * mpMatrix;
          vUVPos = uv;

          // lighting
          vPos = vec3(castedPos * mMatrix);
          vNormal = invMMatrix * normal;
          vMaterial = mtl;
        }
      `,

      fragment: glsl`
        in vec2 vUVPos;
        in vec3 vPos;
        in vec3 vNormal;
        flat in float vMaterial;

        out vec4 fragColor;

        uniform bool textured;
        uniform sampler2D tex0;

        ${calcLightingFragment}

        struct Material {
          vec4 ambient; // 16B, offset: 0
          vec4 diffuse; // 16B, offset: 16,
          vec4 specular; // 16B, offset: 32
          float transparent; // 4B, offset: 48,
          float shine; // 4B, offset: 52,
          // +8B unused
        };

        layout(std140) uniform materialsBlock {
          Material materials[${MAX_MATERIALS_COUNT}];
        };

        void main() {
          // Material color
          int materialIndex = int(vMaterial);
          if (materialIndex != -1) {
            Material _mtl = materials[materialIndex];
            fragColor = _mtl.ambient * _mtl.diffuse;
          } else
            fragColor = vec4(1.0, 1.0, 1.0, 1.0);

          // Texture color
          if (textured)
            fragColor *= texture(tex0, vUVPos);

          fragColor *= vec4(
            calcLighting(vNormal, vPos),
            1.0 // intense
          );
        }
      `,
    },
  },
);

export default createTextureSpriteMaterial;
