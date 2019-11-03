import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

import raceTrackTextureUrl from '@game/res/img/race-track.png';

import {SceneNode} from '@pkg/isometric-renderer/FGL/engine/scene';
import RoadWireframe from './RoadWireframe';
import MetaNode from './MetaNode';

const createRoadRenderer = f => async ({path: {segments}}) => {
  const vertices = [];
  const uv = [];

  segments.forEach((segment) => {
    vertices.push(
      ...segment.toTrianglesVertexList(),
    );

    uv.push(
      ...segment.toTrianglesUVList(),
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
    this.metaNode = new MetaNode(config, this);
  }

  async createRenderer(f, path) {
    this.renderer = await createRoadRenderer(f)(
      {
        path,
      },
    );
  }

  release() {
    super.release();
    this.metaNode.release();
  }

  render(interpolate, mpMatrix, f) {
    super.render(interpolate, mpMatrix, f);
    this.metaNode.render(interpolate, mpMatrix, f);
  }
}
