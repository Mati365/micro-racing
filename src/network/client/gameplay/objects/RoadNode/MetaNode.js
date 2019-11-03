import {SQUARE_TRIANGLES_STRIP_UV_LIST} from '@pkg/isometric-renderer/FGL/core/constants/predefinedLists';

import {vec3} from '@pkg/gl-math';

import {SceneNode} from '@pkg/isometric-renderer/FGL/engine/scene';
import {glsl} from '@pkg/isometric-renderer/FGL/core/material/types';

const createMetaMaterial = fgl => fgl.material.shader(
  {
    shaders: {
      vertex: glsl`
        in vec4 inVertexPos;
        in vec2 inUVPos;

        out vec2 vUVPos;

        uniform mat4 mpMatrix;

        void main() {
          gl_Position = inVertexPos * mpMatrix;

          vUVPos = inUVPos;
        }
      `,

      fragment: glsl`
        in vec2 vUVPos;
        out vec4 fragColor;

        uniform vec4 primaryColor;
        uniform float rectRatio;

        void main() {
          float n = mod(floor(vUVPos.x * 6.0) + floor(vUVPos.y * 6.0 / rectRatio), 2.0);
          n = max(sign(n), 0.0);

          if (n == 0.0 || vUVPos.x <= 0.05 || vUVPos.x >= 0.95 || vUVPos.y <= 0.05 || vUVPos.y >= 0.95)
            fragColor = vec4(0.0);
          else
            fragColor = vec4(primaryColor.xyz, 0.35);
        }
      `,
    },
  },
);

export default class MetaNode extends SceneNode {
  constructor(config, road) {
    const {triangles} = road.segmentsInfo.segments[0];
    const vertices = [
      /**
       * v2--v4
       * |    |
       * |    |
       * v1--v3
       */
      /* v1 */ triangles[0].b,
      /* v2 */ triangles[0].a,
      /* v3 */ vec3.add(
        triangles[0].b,
        vec3.sub(triangles[1].c, triangles[0].a),
      ),
      /* v4 */ triangles[1].c,
    ];

    /**
     * Ratio of filled rectangles inside, make
     * sure that inner filled shapes are squares
     */
    const rectRatio = vec3.dist(vertices[1], vertices[3]) / vec3.dist(vertices[1], vertices[0]);

    super(
      {
        ...config,
        transform: {
          translate: vec3(0.0, 0.0, -0.02),
        },
        uniforms: {
          primaryColor: config.f.colors.WHITE,
          rectRatio,
        },
        renderer: config.f.mesh(
          {
            renderMode: config.f.flags.TRIANGLE_STRIP,
            material: createMetaMaterial(config.f),
            vertices,
            uv: SQUARE_TRIANGLES_STRIP_UV_LIST,
          },
        ),
      },
    );

    this.road = road;
  }
}
