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
          in float inAlpha;

          out vec3 vPos;
          out vec3 vNormal;
          out float vAlpha;

          uniform mat4 mpMatrix;

          const vec3 normal = vec3(${R.join(',', normalDir)});

          void main() {
            gl_Position = inVertexPos * mpMatrix;

            vAlpha = inAlpha;
            vPos = inVertexPos.xyz;
            vNormal = normal;
          }
        `,

        fragment: glsl`
          in vec3 vPos;
          in vec3 vNormal;
          in float vAlpha;

          out vec4 fragColor;

          uniform vec4 color;

          ${calcLightingFragment}

          void main() {
            fragColor = vec4(color.xyz, vAlpha) * vec4(calcLighting(vNormal, vPos), 1.0);
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
    maxSegments = 128,
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
      new Float32Array(maxSegments * SEGMENT_SIZE),
      gl.DYNAMIC_DRAW,
      4,
    );

    this.alphaArray = new Float32Array(maxSegments * 2);
    this.alphaVBO = createVertexBuffer(
      gl,
      this.alphaArray,
      gl.DYNAMIC_DRAW,
      1,
    );

    this.mesh = f.mesh(
      {
        renderMode: f.flags.LINES, // f.flags.TRIANGLE_STRIP,
        material: createWheelTrackMaterial(f)(),
        vbo: this.vbo,
        uniforms: {
          color: f.colors.BLACK,
        },
        buffers: {
          inAlpha: this.alphaVBO,
        },
        elementsCount: 0,
      },
    )
      .instance;
  }

  release() {
    const {vbo, mesh, alphaVBO} = this;

    alphaVBO.release();
    mesh.release();
    vbo.release();
  }

  /**
   * Adds point to VBO. Left and right are borders of wheel.
   * These point shoule be already multed using model matrix!
   *
   * @param {Vec2} leftPoint
   * @param {Vec2} rightPoint
   */
  addTrackSegment(leftPoint, rightPoint) {
    const {
      mesh: {meshDescriptor},
      vbo,
      alphaArray,
      alphaVBO,
    } = this;

    const {elementsCount} = meshDescriptor;
    const {maxSegments, totalSegments} = this;

    // append line to buffer
    const offset = totalSegments % maxSegments;
    vbo.update(
      offset * SEGMENT_BYTE_SIZE, // offset in bytes
      new Float32Array([
        ...leftPoint,
        ...rightPoint,
      ]),
      0, 8,
    );

    // update buffer alpha
    for (let i = offset + 1, no = 0; i !== offset; ++no) {
      i = (i + 1) % maxSegments;

      const saturation = (no + maxSegments * 0.2) / maxSegments;
      alphaArray[i * 2] = saturation;
      alphaArray[i * 2 + 1] = saturation;
    }
    alphaVBO.update(0, alphaArray, 0, alphaArray.length);

    // increment counters
    this.totalSegments++;
    meshDescriptor.elementsCount = Math.min(elementsCount + 2, maxSegments * 2);
  }

  /**
   * Creates segment for wheel every N
   *
   * @param {Matrix} wheelTransform
   */
  static rightWheelCornerMatrix = vec4.toMatrix(vec4(0.5, 0.0, -0.2, 1.0));

  static leftWheelCornerMatrix = vec4.toMatrix(vec4(-0.5, 0.0, -0.2, 1.0));

  track(wheelTransform) {
    this.addTrackSegment(
      mat.mul(
        wheelTransform,
        WheelTrack.rightWheelCornerMatrix,
      ).array,

      mat.mul(
        wheelTransform,
        WheelTrack.leftWheelCornerMatrix,
      ).array,
    );
  }

  render(interpolate, mpMatrix) {
    const {gl, mesh, renderConfig} = this;

    gl.lineWidth(2.0);
    renderConfig.uniforms.mpMatrix = mpMatrix.array;
    mesh.render(renderConfig);
    gl.lineWidth(1.0);
  }
}
