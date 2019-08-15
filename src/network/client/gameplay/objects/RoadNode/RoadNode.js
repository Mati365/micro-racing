import {vec2} from '@pkg/gl-math';
import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

import {SceneNode} from '@pkg/isometric-renderer/FGL/engine/scene';
import raceTrackTextureUrl from '@game/res/img/race-track.png';

import {TrackSegments} from '@game/logic/track';
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
  constructor({track, transform, ...config}) {
    super(
      {
        ...config,
        initialCacheInit: false,
      },
    );

    this.pathInfo = new TrackSegments(
      {
        segmentWidth: 2.5,
        interpolatedPath: track.getInterpolatedPathPoints(),
        transform,
      },
    );

    this.createRenderer(config.f, this.pathInfo);
    this.updateTransformCache();

    this.wireframe = new RoadWireframe(config.f, this.pathInfo);
  }

  async createRenderer(f, path) {
    this.renderer = await createRoadRenderer(f)(
      {
        path,
      },
    );
  }
}
