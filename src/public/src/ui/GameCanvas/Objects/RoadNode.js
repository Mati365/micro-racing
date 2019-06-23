import * as R from 'ramda';

import {mat, vec2, vec4, vec3} from '@pkg/gl-math';
import {createSingleResourceLoader} from '@pkg/resource-pack-loader';

import {SceneNode} from '@pkg/isometric-renderer/FGL/engine/scene';
import raceTrackTextureUrl from '@game/res/img/race-track.png';

const createRoadRenderer = f => async ({path: {triangles}}) => {
  const vertices = [];
  const uv = [];

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

class RoadWireframe {
  constructor(f, pathInfo) {
    const {innerPath, path, outerPath} = pathInfo;

    this.meshes = R.map(
      vertices => f.mesh(
        {
          renderMode: f.flags.LINE_LOOP,
          material: f.material.solidColor,
          vertices,
          uniforms: {
            color: f.colors.RED,
          },
          transform: {
            translate: [0.0, 0.0, -0.01],
          },
        },
      ),
      [
        innerPath,
        path,
        outerPath,
      ],
    );
  }

  render() {
    const {meshes} = this;

    for (let i = meshes.length - 1; i >= 0; --i)
      meshes[i]();
  }
}

export default class RoadNode extends SceneNode {
  constructor({track, ...config}) {
    super(
      {
        ...config,
        initialCacheInit: false,
      },
    );
    this.pathInfo = track.getTriangularizedPath(
      {
        triangleWidth: 20,
      },
    );

    this.createRenderer(config.f, this.pathInfo);
    this.updateTransformCache();

    this.wireframe = new RoadWireframe(config.f, this.transformedTrack);
  }

  /**
   * @see
   *  It is really slow! Do not perform any cache update on RoadNode!
   */
  updateTransformCache() {
    super.updateTransformCache();

    const {transform: transformMatrix} = this.cache;
    this.transformedTrack = R.mapObjIndexed(
      R.map(
        (point) => {
          const output = mat.mul(
            transformMatrix,
            vec4.toMatrix(vec2.toVec4(point)),
          ).array;

          return vec3(output[0], output[1], output[2]);
        },
      ),
      this.pathInfo,
    );
  }

  async createRenderer(f, path) {
    this.renderer = await createRoadRenderer(f)(
      {
        path,
      },
    );
  }
}
