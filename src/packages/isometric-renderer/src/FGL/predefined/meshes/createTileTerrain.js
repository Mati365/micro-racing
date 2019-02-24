import * as R from 'ramda';

const createTexAtlasMaterial = fgl => fgl.material.shader(
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

const createTileMap = (fgl) => {
  const material = createTexAtlasMaterial(fgl);

  return ({tile}) => {
    const {uvSize} = tile;
    const uv = [
      [0.0, uvSize.h],
      [uvSize.w, 0.0],
      [0.0, 0.0],

      [0.0, uvSize.h],
      [uvSize.w, uvSize.h],
      [uvSize.w, 0.0],
    ];

    const mesh = fgl.mesh(
      {
        material,
        renderMode: fgl.flags.TRIANGLES,
        textures: [
          tile.texture, // tex0
        ],
        vertices: R.map(
          R.append(0.0),
          uv,
        ),
        uv,
        uniforms: {
          uvTileSize: [uvSize.w, uvSize.h],
          'posTileOffsets[0]': [
            0, 0,
            1, 0,
            1, 1,
            1, 2,
            2, 0,
          ],
          'uvTileOffsets[0]': [
            1, 0,
            1, 0,
            0, 0,
            0, 0,
            1, 0,
          ],
        },
      },
    );

    return (descriptor) => {
      mesh(
        {
          ...descriptor,
          instances: 5,
        },
      );
    };
  };
};

export default createTileMap;
