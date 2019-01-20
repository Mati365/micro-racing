import React from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';

import {mat, mat4} from '@pkg/gl-math';
import fgl from '@pkg/isometric-renderer';

mat.dump(
  mat.from.scale(
    4,
    [2, 2, 2],
  ),
);

mat.dump(
  mat4.from.scale([2, 2, 2]),
);

export default class GameCanvas extends React.Component {
  static propTypes = {
    dimensions: DIMENSIONS_SCHEMA.isRequired,
  };

  canvasRef = React.createRef();

  componentDidMount() {
    const {current: canvasNode} = this.canvasRef;

    const f = fgl(canvasNode);
    const material = f.material({
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
    });

    console.log(material);

    f.frame(() => {
      f.clear();
    });
  }

  render() {
    const {dimensions} = this.props;

    return (
      <canvas
        ref={this.canvasRef}
        width={dimensions.width}
        height={dimensions.height}
      />
    );
  }
}
