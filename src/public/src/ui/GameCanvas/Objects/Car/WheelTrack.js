import * as R from 'ramda';

import {vec4, mat, vec3} from '@pkg/gl-math';

import {glsl} from '@pkg/isometric-renderer/FGL/core/material/types';
import {calcLightingFragment} from '@pkg/isometric-renderer/FGL/engine/lighting';
import {createVertexBuffer} from '@pkg/isometric-renderer/FGL/core/buffer/types';

const createWheelTrackMaterial = fgl => R.memoizeWith(
  R.identity,
  (normalDir = vec3(0, 0, -1)) => fgl.material.shader(
    {
      shaders: {
        vertex: glsl`
          in vec4 inVertexPos;

          out vec3 vPos;
          out vec3 vNormal;

          uniform mat4 mpMatrix;

          const vec3 normal = vec3(${R.join(',', normalDir)});

          void main() {
            gl_Position = inVertexPos * mpMatrix;

            vPos = inVertexPos.xyz;
            vNormal = normal;
          }
        `,

        fragment: glsl`
          in vec3 vPos;
          in vec3 vNormal;

          out vec4 fragColor;

          uniform vec4 color;

          ${calcLightingFragment}

          void main() {
            fragColor = color * vec4(calcLighting(vNormal, vPos), 1.0);
          }
        `,
      },
    },
  ),
);

export const SEGMENT_SIZE = 4 * 2; // 2 * vec4
export const SEGMENT_BYTE_SIZE = SEGMENT_SIZE * 4;

/**
 * Renders wheel path using tirangles strip
 */
export default class WheelTrack {
  constructor({
    f,
    maxSegments = 128, // 2n + 1 to make stip triangle
  }) {
    const {gl} = f.state;

    this.totalSegments = 0;
    this.maxSegments = maxSegments;

    this.gl = gl;
    this.renderConfig = {
      uniforms: {},
    };

    this.vbo = createVertexBuffer(
      gl,
      Buffer.alloc(maxSegments * SEGMENT_SIZE),
      gl.DYNAMIC_DRAW,
      4,
    );
    this.mesh = f
      .mesh(
        {
          renderMode: f.flags.LINES, // f.flags.TRIANGLE_STRIP,
          material: createWheelTrackMaterial(f)(),
          vbo: this.vbo,
          uniforms: {
            color: vec4(0.0, 0.0, 0.0, 0.75),
          },
          elementsCount: 0,
        },
      )
      .instance;
  }

  /**
   * Adds point to VBO. Left and right are borders of wheel.
   * These point shoule be already multed using model matrix!
   *
   * @param {Vec2} leftPoint
   * @param {Vec2} rightPoint
   */
  addTrackSegment(leftPoint, rightPoint) {
    const {mesh: {meshDescriptor}, vbo} = this;
    const {elementsCount} = meshDescriptor;
    const {maxSegments, totalSegments} = this;

    vbo.update(
      (totalSegments % (maxSegments / 2)) * SEGMENT_BYTE_SIZE, // offset in bytes
      new Float32Array([
        ...leftPoint,
        ...rightPoint,
      ]),
      0, 8,
    );

    this.totalSegments++;
    meshDescriptor.elementsCount = Math.min(elementsCount + 2, maxSegments);
  }

  /**
   * Creates segment for wheel every N
   *
   * @param {Matrix} wheelTransform
   */
  track(wheelTransform) {
    this.addTrackSegment(
      mat.mul(
        wheelTransform,
        vec4.toMatrix(vec4(0.5, 0.0, -0.2, 1.0)),
      ).array,

      mat.mul(
        wheelTransform,
        vec4.toMatrix(vec4(-0.5, 0.0, -0.2, 1.0)),
      ).array,
    );
  }

  render(delta, mpMatrix) {
    const {gl, mesh, renderConfig} = this;

    gl.lineWidth(2.5);
    renderConfig.uniforms.mpMatrix = mpMatrix.array;
    mesh.render(renderConfig);
    gl.lineWidth(1.0);
  }
}
