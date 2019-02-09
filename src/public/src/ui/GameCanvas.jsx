import React from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';

import fgl from '@pkg/isometric-renderer';
import {
  vec4,
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
    const color = vec4(1, 0, 0, 1);
    const triangle = f.mesh.triangle();

    f.frame(() => {
      f.clear();
      triangle(
        {
          uniforms: {
            mpMatrix: mpMatrix.array,
            color,
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
