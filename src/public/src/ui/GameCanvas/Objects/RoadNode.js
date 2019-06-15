import {vec2} from '@pkg/gl-math';
import {SceneNode} from '@pkg/isometric-renderer/FGL/engine/scene';

const createRoadRenderer = f => ({track}) => {
  const vertices = [];

  const {triangles} = track.getTriangularizedPath(
    {
      triangleWidth: 30,
    },
  );

  triangles.forEach((triangle) => {
    vertices.push(
      vec2.toVec3(triangle.a),
      vec2.toVec3(triangle.c),

      vec2.toVec3(triangle.a),
      vec2.toVec3(triangle.b),

      vec2.toVec3(triangle.b),
      vec2.toVec3(triangle.c),
    );
  });

  return f.mesh(
    {
      // not filled triangles
      renderMode: f.flags.LINES,
      material: f.material.solidColor,
      vertices,
    },
  );
};

export default class RoadNode extends SceneNode {
  constructor({track, ...config}) {
    super({
      ...config,
      renderer: config.renderer || createRoadRenderer(config.f)(
        {
          track,
        },
      ),
    });
  }
}
