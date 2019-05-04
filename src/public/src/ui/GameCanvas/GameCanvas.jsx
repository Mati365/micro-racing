import React, {useRef, useEffect} from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';

import {createIsometricScene} from '@pkg/isometric-renderer';
import {
  toRadians,
  mat4,
} from '@pkg/gl-math';

import atlasImageUrl from '@game/res/img/atlas.png';

// import EditorCanvas from '../EditorCanvas';
import PhysicsCanvas from '../PhysicsCanvas';

import generateTerrain from './utils/generateTerrain';
import createTexturedCar, {CAR_COLORS} from './utils/createTexturedCar';

const attachEngine = async (aspectRatio, canvas) => {
  const {f, frame} = createIsometricScene(
    {
      canvas,
      aspectRatio,
    },
  );

  const terrainWireframe = f.mesh.plainTerrainWireframe(
    {
      w: 20,
      h: 20,
    },
  );

  const redCar = await createTexturedCar(f)(CAR_COLORS.RED);
  const blueCar = await createTexturedCar(f)(CAR_COLORS.BLUE);

  const terrain = await generateTerrain(f)(
    {
      atlasImageUrl,
      atlasSize: {
        w: 5,
        h: 5,
      },
      size: {
        w: 10,
        h: 10,
      },
    },
  );

  const pyramid = f.mesh.pyramid();
  const box = f.mesh.box();
  const boxBatch = f.mesh.batch(
    {
      mesh: box,
    },
  );

  frame((dt, mpMatrix) => {
    terrainWireframe(
      {
        uniforms: {
          color: f.colors.DARK_GRAY,
          mpMatrix: mat4.mul(
            mpMatrix,
            mat4.from.scaling([20.0, 20.0, 1.0]),
          ).array,
        },
      },
    );

    terrain(
      {
        uniforms: {
          mpMatrix: mat4.mul(
            mpMatrix,
            mat4.from.scaling([10.0, 10.0, 1.0]),
          ).array,
        },
      },
    );

    boxBatch.batch(
      {
        uniforms: {
          color: f.colors.GREEN,
          mpMatrix: mat4.compose.mul(
            mat4.from.scaling([1.0, 1.0, 1.5]),
            mat4.from.translation([6.0, 6.0, -0.01]),
            mpMatrix,
          ).array,
        },
      },
    );

    boxBatch();

    redCar(
      {
        uniforms: {
          // color: f.colors.YELLOW,
          mpMatrix: mat4.compose.mul(
            mat4.from.rotation([
              0,
              0,
              toRadians(180),
            ]),
            mat4.from.scaling([0.25, 0.25, -0.25]),
            mat4.from.translation([2, 2, -2]),
            mpMatrix,
          ).array,
        },
      },
    );

    blueCar(
      {
        uniforms: {
          // color: f.colors.YELLOW,
          mpMatrix: mat4.compose.mul(
            mat4.from.rotation([
              0,
              0,
              toRadians(180),
            ]),
            mat4.from.scaling([0.25, 0.25, -0.25]),
            mat4.from.translation([2, 4, -2]),
            mpMatrix,
          ).array,
        },
      },
    );
    pyramid(
      {
        uniforms: {
          color: f.colors.YELLOW,
          mpMatrix: mat4.compose.mul(
            mat4.from.scaling([1.0, 1.0, 1.5]),
            mat4.from.translation([0, 0, -0.01]),
            mpMatrix,
          ).array,
        },
      },
    );
  });
};

const GameCanvas = ({dimensions}) => {
  const canvasRef = useRef();

  useEffect(
    () => {
      attachEngine(
        1.16,
        canvasRef.current,
      );
    },
    [],
  );

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={dimensions.w}
        height={dimensions.h}
      />

      {/* <EditorCanvas dimensions={dimensions} /> */}

      <PhysicsCanvas dimensions={dimensions} />
    </div>
  );
};

GameCanvas.displayName = 'GameCanvas';

GameCanvas.propTypes = {
  dimensions: DIMENSIONS_SCHEMA,
};

GameCanvas.defaultProps = {
  dimensions: {
    w: 640,
    h: 550,
  },
};

export default GameCanvas;
