import React from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';

import createResourcePackLoader from '@pkg/resource-pack-loader';
import fgl from '@pkg/isometric-renderer';
import {
  vec3,
  mat4,
} from '@pkg/gl-math/matrix';

const attachEngine = (canvas) => {
  const f = fgl(canvas);

  const DIST = Math.sqrt(1 / 3.0);

  const camera = mat4.from.translation([0.0, 0.0, 0.5]);
  const mpMatrix = mat4.mul(
    mat4.lookAt(
      {
        eye: vec3(DIST, DIST, DIST),
        at: vec3(0.0, 0.0, 0.0),
        up: vec3(0.0, 0.0, 1.0), // Z axis is UP
      },
    ),
    camera,
  );

  const terrainWireframe = f.mesh.plainTerrainWireframe(
    {
      w: 5,
      h: 5,
    },
  );

  const box = f.mesh.box();
  const pyramid = f.mesh.pyramid();

  f.frame(() => {
    terrainWireframe(
      {
        uniforms: {
          color: f.colors.DARK_GRAY,
          mpMatrix: mat4.mul(
            mpMatrix,
            mat4.from.translation([0.0, 0.0, -0.005]),
          ).array,
        },
      },
    );

    box(
      {
        uniforms: {
          color: f.colors.GREEN,
          mpMatrix: mat4.mul(
            mpMatrix,
            mat4.mul(
              mat4.from.scaling([0.2, 0.2, 0.3]),
              mat4.from.translation([2, 2, 0.0]),
            ),
          ).array,
        },
      },
    );

    box(
      {
        uniforms: {
          color: f.colors.RED,
          mpMatrix: mat4.mul(
            mpMatrix,
            mat4.mul(
              mat4.from.scaling([0.2, 0.2, 0.3]),
              mat4.from.translation([3, 4, 0.0]),
            ),
          ).array,
        },
      },
    );

    pyramid(
      {
        uniforms: {
          color: f.colors.YELLOW,
          mpMatrix: mat4.mul(
            mpMatrix,
            mat4.mul(
              mat4.from.scaling([0.2, 0.2, 0.3]),
              mat4.from.translation([3, 2, 0.0]),
            ),
          ).array,
        },
      },
    );
  });
};

export default class GameCanvas extends React.Component {
  static propTypes = {
    dimensions: DIMENSIONS_SCHEMA.isRequired,
  };

  canvasRef = React.createRef();

  async componentDidMount() {
    const resources = await createResourcePackLoader()(
      {
        car: 'https://www.clipartmax.com/png/middle/181-1818141_170-clip-art-at-clker-car-2d-top-view-png.png',
        magic: 'https://cdn.theatlantic.com/assets/media/img/mt/2018/09/AP_18255638666993/lead_720_405.jpg',
      },
    ).toPromise();

    console.log(resources);

    attachEngine(this.canvasRef.current);
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
