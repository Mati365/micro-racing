import {vec2} from '@pkg/gl-math';
import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

import {SceneNode} from '@pkg/isometric-renderer/FGL/engine/scene';
import raceTrackTextureUrl from '@game/res/img/race-track.png';

import RoadWireframe from './RoadWireframe';

const createRoadRenderer = f => async ({path: {segments}}) => {
  const vertices = [];
  const uv = [];

  segments.forEach((segment) => {
    const {triangles} = segment;

    vertices.push(
      triangles[0].a,
      triangles[0].b,
      triangles[0].c,

      triangles[1].a,
      triangles[1].b,
      triangles[1].c,
    );

    uv.push(
      // down
      vec2(0.0, 0.0),
      vec2(1.0, 1.0),
      vec2(0.0, 1.0),

      // uper
      vec2(1.0, 0.0),
      vec2(1.0, 1.0),
      vec2(0.0, 1.0),
    );
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
  constructor({segmentsInfo, transform, ...config}) {
    super(
      {
        ...config,
        initialCacheInit: false,
      },
    );

    this.segmentsInfo = segmentsInfo;

    this.createRenderer(config.f, this.segmentsInfo);
    this.updateTransformCache();

    this.wireframe = new RoadWireframe(config.f, this);
  }

  async createRenderer(f, path) {
    this.renderer = await createRoadRenderer(f)(
      {
        path,
      },
    );
  }
}
