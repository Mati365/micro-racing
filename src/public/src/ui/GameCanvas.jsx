import React from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';

import fgl from '@pkg/isometric-renderer';
import {
  toRadians,
  mat4,
} from '@pkg/gl-math';

export default class GameCanvas extends React.Component {
  static propTypes = {
    dimensions: DIMENSIONS_SCHEMA.isRequired,
  };

  canvasRef = React.createRef();

  componentDidMount() {
    const {dimensions} = this.props;
    const {current: canvasNode} = this.canvasRef;

    const f = fgl(canvasNode);
    const projection = mat4.perspective(
      {
        fov: toRadians(45),
        aspect: dimensions.w / dimensions.h,
        near: 0.1,
        far: 100,
      },
    );

    const mpMatrix = mat4.mul(
      projection,
      mat4.from.translation([0, 0, 0]),
    );

    console.log(projection);

    /**
     * @see {@link https://stackoverflow.com/questions/13780609/what-does-precision-mediump-float-mean}
     * https://github.com/WebGLSamples/WebGL2Samples/blob/master/samples/texture_2d_array.html
     */
    const defaultMaterial = f.material(
      {
        shaders: {
          vertex: `
            in vec4 inVertexPos;

            uniform mat4 mpMatrix;

            void main() {
              gl_Position = inVertexPos;
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
          -1.0, -1.0, 0.0,
          1.0, -1.0, 0.0,
          0.0, 1.0, 0.0,
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
