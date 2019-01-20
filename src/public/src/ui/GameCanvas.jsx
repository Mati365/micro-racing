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

    console.log(mat4.from);
    const projection = mat4();
    const mv = mat4.from.translation([0, 0, -6]);

    const perspective = mat4.perspective(
      {
        fov: toRadians(45),
        aspect: dimensions.w / dimensions.h,
        near: 0.1,
        far: 100,
      },
    );

    console.log(perspective, projection);

    const material = f.material(
      {
        shaders: {
          vertex: `
            attribute vec4 aVertexPosition;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            void main() {
              gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            }
          `,

          fragment: `
            void main() {
              gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
          `,
        },

        uniforms: {
          uModelViewMatrix: {type: 'mat4'},
          uProjectionMatrix: {type: 'mat4'},
        },

        attributes: {
          aVertexPosition: {type: 'vec4'},
        },
      },
    );

    const triangle = f.mesh(
      {
        vertices: [
          1.0, 1.0,
          -1.0, 1.0,
          1.0, 1.0,
          -1.0, 1.0,
        ],
      },
    );

    console.log(mv, material, triangle);

    f.frame(() => {
      f.clear();
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
