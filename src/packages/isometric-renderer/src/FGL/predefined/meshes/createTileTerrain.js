import * as R from 'ramda';

export const createTexAtlasMaterial = fgl => fgl.material.shader(
  {
    shaders: {
      vertex: `
        in vec4 inVertexPos;
        in vec2 inUVPos;

        // to frag shader
        out vec2 vUVPos;
        flat out int vInstanceID;

        uniform mat4 mpMatrix;
        uniform vec2 posTileOffsets[100];
        uniform vec2 uvTileSize;

        void main() {
          vec2 offset = uvTileSize * posTileOffsets[gl_InstanceID];
          gl_Position = (inVertexPos + vec4(offset, 0, 0)) * mpMatrix;

          vInstanceID = gl_InstanceID;
          vUVPos = inUVPos;
        }
      `,

      fragment: `
        out vec4 fragColor;
        in vec2 vUVPos;
        flat in int vInstanceID;

        // atlas texture
        uniform sampler2D tex0;

        // offsets
        uniform vec2 uvTileSize;
        uniform vec2 uvTileOffsets[100];

        void main() {
          fragColor = texture(tex0, vUVPos + (uvTileOffsets[vInstanceID] * uvTileSize));
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

    const tileOffsets = R.compose(
      R.unnest,
      R.times(
        index => ([
          index % size.w,
          Number.parseInt(index / size.w, 10),
        ]),
      ),
    )(instances);

    const uvOffsets = R.compose(
      R.unnest,
      R.pluck('uv'),
    )(items);

    const mesh = fgl.mesh(
      {
        material,
        renderMode: fgl.flags.TRIANGLES,
        textures: [
          texTile.texture, // tex0
        ],
        vertices: R.map(
          R.append(0.0),
          uv,
        ),
        uv,
        uniforms: {
          uvTileSize: [
            uvSize.w,
            uvSize.h,
          ],
          'posTileOffsets[0]': tileOffsets,
          'uvTileOffsets[0]': uvOffsets,
        },
      },
    );

    return (descriptor) => {
      mesh(
        {
          ...descriptor,
          instances,
        },
      );
    };
  };
};

export default createTileTerrain;
