import {vec2} from '@pkg/gl-math';
import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

import {SceneNode} from '@pkg/isometric-renderer/FGL/engine/scene';
import raceTrackTextureUrl from '@game/res/img/race-track.png';

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
      material: f.material.billboardMesh(), // createRoadMaterial(f),
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
