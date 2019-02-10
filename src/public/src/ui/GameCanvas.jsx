import React from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';

import fgl from '@pkg/isometric-renderer';
import {
  vec3,
  vec4,
  mat4,
} from '@pkg/gl-math/matrix';

export default class GameCanvas extends React.Component {
  static propTypes = {
    dimensions: DIMENSIONS_SCHEMA.isRequired,
  };

  canvasRef = React.createRef();

  componentDidMount() {
    const {current: canvasNode} = this.canvasRef;

    const f = fgl(canvasNode);
    const projection = mat4.from.identity();

    const model = mat4.mul(
      mat4.from.scaling([1.0, 1.0, 1.0]),
      mat4.from.translation([0.0, 0.0, 0.5]),
    );

    const DIST = Math.sqrt(1 / 3.0);
    const mpMatrix = mat4.mul(
      projection,
      mat4.mul(
        mat4.lookAt(
          {
            eye: vec3(DIST, DIST, DIST),
            at: vec3(0.0, 0.0, 0.0),
            up: vec3(0.0, 0.0, 1.0), // Z axis is UP
          },
        ),
        model,
      ),
    );

    const color = vec4(0.2, 0.2, 0.2, 1);
    const terrainWireframe = f.mesh.plainTerrainWireframe(
      {
        w: 6,
        h: 6,
      },
    );

    f.frame(() => {
      terrainWireframe(
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
