import {vec2} from '@pkg/gl-math';
import {glsl} from '@pkg/isometric-renderer/FGL/core/material/types';

import {createSingleResourceLoader} from '@pkg/resource-pack-loader';
import {calcLightingFragment} from '@pkg/isometric-renderer/FGL/engine/lighting';

import {SceneNode} from '@pkg/isometric-renderer/FGL/engine/scene';
import raceTrackTextureUrl from '@game/res/img/race-track.png';

const createRoadMaterial = f => f.material.shader(
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

        const vec3 normal = vec3(0, 0, -1);

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

const createRoadRenderer = f => async ({track}) => {
  const vertices = [];
  const uv = [];

  const {triangles} = track.getTriangularizedPath(
    {
      triangleWidth: 20,
    },
  );

  triangles.forEach((triangle, index) => {
    vertices.push(
      vec2.toVec3(triangle.a),
      vec2.toVec3(triangle.b),
      vec2.toVec3(triangle.c),
    );

    if (index % 2) {
      // down
      uv.push(
        vec2(0.0, 0.0),
        vec2(1.0, 1.0),
        vec2(0.0, 1.0),
      );
    } else {
      // uper
      uv.push(
        vec2(1.0, 0.0),
        vec2(1.0, 1.0),
        vec2(0.0, 1.0),
      );
    }
  });

  return f.mesh(
    {
      renderMode: f.flags.TRIANGLES,
      material: createRoadMaterial(f),
      vertices,
      uv,
      textures: [
        f.texture2D(
          {
            image: await createSingleResourceLoader()(raceTrackTextureUrl),
          },
        ),
      ],
    },
  );
};

export default class RoadNode extends SceneNode {
  constructor({track, ...config}) {
    super(config);

    if (!config.renderer)
      this.createRenderer(config.f, track);
  }

  async createRenderer(f, track) {
    this.renderer = await createRoadRenderer(f)(
      {
        track,
      },
    );
  }
}
