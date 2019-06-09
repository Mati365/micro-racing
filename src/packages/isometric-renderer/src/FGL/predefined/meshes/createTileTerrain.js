import * as R from 'ramda';

import {createVertexBuffer} from '../../buffer/types';
import {glsl} from '../../material/types';
import {
  calcLightingFragment,
} from '../materials/glsl/lights';

export const createTexAtlasMaterial = fgl => fgl.material.shader(
  {
    shaders: {
      vertex: glsl`
        in vec4 inVertexPos;
        in vec2 inUVPos;

        // external VBOs
        in vec2 inPosTileOffset;
        in vec2 inUvTileOffset;

        // to frag shader
        out vec2 vUVPos;
        out vec2 vUVOffset;
        out vec4 vLightColor;

        uniform mat3 invMMatrix;
        uniform mat4 mMatrix;
        uniform mat4 mpMatrix;
        uniform vec2 tileSize;

        ${calcLightingFragment}

        const vec3 normal = vec3(0, 0, -1);

        void main() {
          vec2 offset = tileSize * inPosTileOffset;
          vec4 offsetVertexPos = inVertexPos + vec4(offset, 0, 0);

          gl_Position = offsetVertexPos * mpMatrix;

          vUVOffset = inUvTileOffset;
          vUVPos = inUVPos;

          vec3 vPos = vec3(offsetVertexPos * mMatrix);
          vLightColor = vec4(calcLighting(normal, vPos), 1.0);
        }
      `,

      fragment: glsl`
        out vec4 fragColor;

        in vec2 vUVPos;
        in vec2 vUVOffset;
        in vec4 vLightColor;

        uniform sampler2D tex0; // atlas texture
        uniform vec2 uvTileSize; // offsets

        void main() {
          vec4 color = texture(tex0, vUVPos + (vUVOffset * uvTileSize));

          fragColor = color * vLightColor;
        }
      `,
    },
  },
);

/**
 * @see
 *  Map is generally static VBO
 *
 * @param {FGL} fgl
 * @param {Object} map
 *
 * @example
 *  items = [
 *    {uv: [0, 0]},
 *    ...
 *  ]
 */
const createTileTerrain = (fgl) => {
  const material = createTexAtlasMaterial(fgl);
  const {gl} = fgl.state;

  return ({
    texTile,
    size,
    items,
  }) => {
    const {uvSize} = texTile;
    const instances = Math.max(items.length, size.w * size.h);

    const uv = [
      [0.0, uvSize.h],
      [uvSize.w, 0.0],
      [0.0, 0.0],

      [0.0, uvSize.h],
      [uvSize.w, uvSize.h],
      [uvSize.w, 0.0],
    ];

    // used in instancing
    const uvOffsets = R.pluck('uv')(items);
    const tileOffsets = R.times(
      index => ([
        index % size.w,
        Number.parseInt(index / size.w, 10),
      ]),
    )(instances);

    const mesh = fgl.mesh(
      {
        material,
        renderMode: fgl.flags.TRIANGLES,
        textures: [
          texTile.texture, // tex0
        ],

        // required mesh buffers
        uv,
        vertices: R.map(
          R.append(0.0),
          uv,
        ),

        // external attributes / unfiroms
        buffers: {
          inPosTileOffset: createVertexBuffer(gl, tileOffsets, gl.STATIC_DRAW, 2, 1),
          inUvTileOffset: createVertexBuffer(gl, uvOffsets, gl.STATIC_DRAW, 2, 1),
        },
        uniforms: {
          tileSize: [
            1.0 / size.w,
            1.0 / size.h,
          ],
          uvTileSize: [
            uvSize.w,
            uvSize.h,
          ],
        },
      },
    );

    return (descriptor) => {
      descriptor.instances = instances;
      mesh(descriptor);
    };
  };
};

export default createTileTerrain;
