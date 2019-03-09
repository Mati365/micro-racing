import React from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';

import fgl, {createIsometricProjection} from '@pkg/isometric-renderer';
import {createSingleResourceLoader} from '@pkg/resource-pack-loader';
import {mat4} from '@pkg/gl-math/matrix';

import atlasImageUrl from '@game/res/img/atlas.png';

const createTerrain = async (f) => {
  const atlasImage = await createSingleResourceLoader()(atlasImageUrl);
  const texTile = f.tileTexture2D(
    {
      atlasImage,
      size: {
        w: 5,
        h: 5,
      },
    },
  );

  return f.mesh.tileTerrain(
    {
      texTile,
      size: {
        w: 5,
        h: 5,
      },
      items: [
        {uv: [2, 0]}, {uv: [2, 0]}, {uv: [2, 0]}, {uv: [0, 0]}, {uv: [0, 0]},
        {uv: [0, 0]}, {uv: [1, 0]}, {uv: [0, 0]}, {uv: [0, 0]}, {uv: [0, 0]},
        {uv: [0, 0]}, {uv: [1, 0]}, {uv: [0, 0]}, {uv: [0, 0]}, {uv: [0, 0]},
        {uv: [0, 0]}, {uv: [0, 0]}, {uv: [0, 0]}, {uv: [0, 0]}, {uv: [0, 0]},
        {uv: [0, 0]}, {uv: [0, 0]}, {uv: [0, 0]}, {uv: [0, 0]}, {uv: [0, 0]},
      ],
    },
  );
};

const attachEngine = async (virtualResolution, dimensions, canvas) => {
  const f = fgl(canvas);
  const projection = createIsometricProjection(virtualResolution, dimensions);
  const camera = mat4.from.translation([0.0, 0.0, 0.5]);

  const mpMatrix = mat4.mul(
    projection,
    camera,
  );

  const terrainWireframe = f.mesh.plainTerrainWireframe(
    {
      w: 5,
      h: 5,
    },
  );

  const terrain = await createTerrain(f);
  const pyramid = f.mesh.pyramid();
  const box = f.mesh.box();
  const boxBatch = f.mesh.batch(
    {
      mesh: box,
    },
  );

  f.frame(() => {
    terrainWireframe(
      {
        uniforms: {
          color: f.colors.DARK_GRAY,
          mpMatrix: mat4.mul(
            mpMatrix,
            mat4.from.translation([0.0, 0.0, 0.0]),
          ).array,
        },
      },
    );

    terrain(
      {
        uniforms: {
          mpMatrix: mat4.mul(
            mpMatrix,
            mat4.from.translation([0.0, 0.0, 0.0]),
          ).array,
        },
      },
    );

    boxBatch.batch(
      {
        uniforms: {
          color: f.colors.GREEN,
          mpMatrix: mat4.mul(
            mpMatrix,
            mat4.mul(
              mat4.from.scaling([0.2, 0.2, 0.3]),
              mat4.from.translation([2.0, 2.0, -0.01]),
            ),
          ).array,
        },
      },
    );

    boxBatch.batch(
      {
        uniforms: {
          color: f.colors.RED,
          mpMatrix: mat4.mul(
            mpMatrix,
            mat4.mul(
              mat4.from.scaling([0.2, 0.2, 0.3]),
              mat4.from.translation([3, 4, -0.01]),
            ),
          ).array,
        },
      },
    );

    boxBatch();

    pyramid(
      {
        uniforms: {
          color: f.colors.YELLOW,
          mpMatrix: mat4.mul(
            mpMatrix,
            mat4.mul(
              mat4.from.scaling([0.2, 0.2, 0.3]),
              mat4.from.translation([3, 2, -0.01]),
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
    const {dimensions} = this.props;

    attachEngine(
      {
        w: 640,
        h: 550,
      },
      dimensions,
      this.canvasRef.current,
    );
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
