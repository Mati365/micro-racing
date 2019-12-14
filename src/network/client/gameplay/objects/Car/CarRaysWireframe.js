import {createVertexBuffer} from '@pkg/isometric-renderer/FGL/core/buffer/types';
import {SceneRenderable} from '@pkg/isometric-renderer/FGL/engine/scene';

export default class CarRaysWireframe extends SceneRenderable {
  constructor(f, {color, intersectRays}) {
    const {gl} = f.state;

    super();

    this.f = f;

    this.intersectRays = intersectRays;
    this.raysBuffer = new Float32Array(intersectRays.rays.length * 2 * 4);
    this.raysVBO = createVertexBuffer(
      gl,
      this.raysBuffer, // src end
      gl.DYNAMIC_DRAW,
      4,
    );

    this.mesh = f.mesh(
      {
        renderMode: f.flags.LINES,
        material: f.material.solidColor,
        vbo: this.raysVBO,
        uniforms: {
          color: color || f.colors.GREEN,
        },
      },
    );
  }

  update() {
    const {intersectRays, raysVBO, raysBuffer} = this;

    // update positions / logic
    intersectRays.update();

    // update RAM buffer
    const {rays} = intersectRays;
    let offset = 0;

    for (let i = rays.length - 1; i >= 0; --i) {
      const {edge} = rays[i];

      raysBuffer.set(edge.a, offset); offset += 2;
      raysBuffer[offset++] = -0.1; // z
      raysBuffer[offset++] = 1.0; // w

      raysBuffer.set(edge.b, offset); offset += 2;
      raysBuffer[offset++] = -0.1; // z
      raysBuffer[offset++] = 1.0; // w
    }

    // update VBO buffer
    raysVBO.update(0, raysBuffer, 0, raysBuffer.length);
  }

  release() {
    this.mesh.instance.release();
  }

  render(interpolate, mpMatrix) {
    const {mesh} = this;

    mesh(
      {
        uniforms: {
          mpMatrix: mpMatrix.array,
        },
      },
    );
  }
}
