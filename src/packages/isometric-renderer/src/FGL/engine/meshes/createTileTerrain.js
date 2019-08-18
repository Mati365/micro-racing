import * as R from 'ramda';

import {vec2} from '@pkg/gl-math';

import {createVertexBuffer} from '../../core/buffer/types';
import {glsl} from '../../core/material/types';
import {calcLightingFragment} from '../lighting';

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
        out vec3 vPos;
        out vec3 vNormal;

        uniform mat4 mMatrix;
        uniform mat4 mpMatrix;
        uniform vec2 tileSize;

        const vec3 normal = vec3(0, 0, -1);

        void main() {
          vec4 offsetVertexPos = vec4(tileSize, 1.0, 1.0) * (inVertexPos + vec4(inPosTileOffset, 0, 0));

          gl_Position = offsetVertexPos * mpMatrix;

          vUVOffset = inUvTileOffset;
          vUVPos = inUVPos;

          vPos = vec3(offsetVertexPos * mMatrix);
          vNormal = normal;
        }
      `,

      fragment: glsl`
        out vec4 fragColor;

        in vec2 vUVPos;
        in vec2 vUVOffset;

        in vec3 vPos;
        in vec3 vNormal;

        uniform sampler2D tex0; // atlas texture
        uniform vec2 uvTileSize; // offsets

        ${calcLightingFragment}

        void main() {
          vec4 color = texture(tex0, vUVPos + (vUVOffset * uvTileSize));

          fragColor = color * vec4(calcLighting(vNormal, vPos), 1.0);
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
    const tileSize = vec2(
      1.0 / size.w,
      1.0 / size.h,
    );

    const instances = Math.max(items.length, size.w * size.h);
    const uv = [
      [0.0, uvSize.y],
      [uvSize.x, 0.0],
      [0.0, 0.0],

      [0.0, uvSize.y],
      [uvSize.x, uvSize.y],
      [uvSize.x, 0.0],
    ];

    const vertices = [
      [0.0, 1.0],
      [1.0, 0.0],
      [0.0, 0.0],

      [0.0, 1.0],
      [1.0, 1.0],
      [1.0, 0.0],
    ];

    // used in instancing
    // run inside self invoked function
    // tell GC that uvOffsets, tileOffsets can be destroyed
    const buffers = (() => {
      const uvOffsets = R.pluck('uv')(items);
      const tileOffsets = R.times(
        index => ([
          index % size.w,
          Number.parseInt(index / size.w, 10),
        ]),
      )(instances);

      return {
        inPosTileOffset: createVertexBuffer(gl, tileOffsets, gl.STATIC_DRAW, 2, 1),
        inUvTileOffset: createVertexBuffer(gl, uvOffsets, gl.STATIC_DRAW, 2, 1),
      };
    })();

    const mesh = fgl.mesh(
      {
        material,
        renderMode: fgl.flags.TRIANGLES,
        textures: [
          texTile.texture, // tex0
        ],

        // required mesh buffers
        uv,
        vertices,

        // external attributes / unfiroms
        buffers,
        uniforms: {
          tileSize,
          uvTileSize: uvSize,
        },
      },
    );

    const renderer = (descriptor) => {
      descriptor.instances = instances;
      mesh(descriptor);
    };

    renderer.release = () => {
      mesh.release();

      R.forEachObjIndexed(
        buffer => buffer.release(),
        buffers,
      );
    };

    return renderer;
  };
};

export default createTileTerrain;
