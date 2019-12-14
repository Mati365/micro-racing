import {
  toGLSLTypeDef,
  createPackedStruct,
} from '@pkg/struct-pack';

import {glsl} from '../../core/material/types';
import {calcLightingFragment} from '../lighting';

export const MAX_MATERIALS_COUNT = 4;

export const MeshMaterial = createPackedStruct(
  {
    fields: {
      ambient: 'vec4',
      diffuse: 'vec4',
      specular: 'vec4',
      transparent: 'float',
      shine: 'float',
    },
  },
);

export const MeshMaterialBlock = createPackedStruct(
  {
    defs: {
      Material: MeshMaterial,
    },
    fields: {
      materials: `Material[${MAX_MATERIALS_COUNT}]`,
    },
  },
);

export const packMaterialsBuffer = (materials) => {
  const buffer = new Float32Array(MeshMaterialBlock.binary.size / 4);
  const count = Math.min(MAX_MATERIALS_COUNT, materials.length);

  for (let i = 0, offset = 0; i < count; ++i, offset += MeshMaterial.binary.size / 4)
    materials[i].pack(buffer, offset);

  return buffer;
};

const createMaterialMeshMaterial = fgl => fgl.material.shader(
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
        uniform float opacity;

        ${calcLightingFragment}

        struct Material {
          ${toGLSLTypeDef(MeshMaterial)}
        };

        layout(std140) uniform materialsBlock {
          ${toGLSLTypeDef(MeshMaterialBlock)}
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
            opacity // intense
          );
        }
      `,
    },
  },
);

export default createMaterialMeshMaterial;
