import React from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';

import fgl from '@pkg/isometric-renderer';
import {
  vec3,
  mat4,
} from '@pkg/gl-math/matrix';

export default class GameCanvas extends React.Component {
  static propTypes = {
    dimensions: DIMENSIONS_SCHEMA.isRequired,
  };

  canvasRef = React.createRef();

  componentDidMount() {
    const {dimensions} = this.props;
    const {current: canvasNode} = this.canvasRef;

    const f = fgl(canvasNode);
    const projection = mat4.ortho(
      {
        near: 0,
        far: 1,
        top: 0,
        left: 0,
        right: dimensions.w,
        bottom: dimensions.h,
      },
    );

    const model = mat4.mul(
      mat4.from.translation([dimensions.w / 2 - 100, dimensions.h / 2 - 100, 0.0]),
      mat4.from.scaling([200.0, 200.0, 0.0]),
    );

    const mpMatrix = mat4.mul(projection, model);

    console.log(vec3.len([1, 2, 3]));
    console.log(vec3.normalize([1, 2, 3]));

    const defaultMaterial = f.material(
      {
        shaders: {
          vertex: `
            in vec4 inVertexPos;

            uniform mat4 mpMatrix;

            void main() {
              gl_Position = inVertexPos * mpMatrix;
            }
          `,

          fragment: `
            out vec4 fragColor;

            void main() {
              fragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
          `,
        },
      },
    );

    const triangle = f.mesh(
      {
        material: defaultMaterial,
        vertices: [
          0.5, 0.0, 0.0,
          0.0, 1.0, 0.0,
          1.0, 1.0, 0.0,
        ],
      },
    );

    f.frame(() => {
      f.clear();
      triangle(
        {
          uniforms: {
            mpMatrix: mpMatrix.array,
          },
        },
      );
    });
  }

  render() {
    const {dimensions} = this.props;

    return (
      <canvas
        ref={this.canvasRef}
        width={dimensions.w}
        height={dimensions.h}
      />
    );
  }
}
