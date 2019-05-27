import React, {useRef, useEffect} from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';

import {createIsometricScene} from '@pkg/isometric-renderer';
import {toRadians} from '@pkg/gl-math';

import atlasImageUrl from '@game/res/img/atlas.png';

// import EditorCanvas from '../EditorCanvas';
import PhysicsCanvas from '../PhysicsCanvas';

import generateTerrain from './utils/generateTerrain';
import createTexturedCar, {CAR_COLORS} from './utils/createTexturedCar';
import createTexturedTree from './utils/createTexturedTree';

const attachEngine = async (aspectRatio, canvas) => {
  const {f, frame} = createIsometricScene(
    {
      canvas,
      aspectRatio,
    },
  );

  const scene = f.createSceneBuffer();
  scene
    .chain
    .createNode(
      {
        mesh: f.mesh.plainTerrainWireframe(
          {
            w: 20,
            h: 20,
          },
        ),
        uniforms: {
          color: f.colors.DARK_GRAY,
        },
        transform: {
          scale: [20.0, 20.0, 1.0],
        },
      },
    )
    .createNode(
      async () => ({
        mesh: await generateTerrain(f)(
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
        ),
        transform: {
          scale: [10.0, 10.0, 1.0],
        },
      }),
    )
    .createNode(
      {
        mesh: f.mesh.box(),
        uniforms: {
          color: f.colors.GREEN,
        },
        transform: {
          scale: [1.0, 1.0, 1.5],
          translate: [6, 6, -0.01],
        },
      },
    )
    .createNode(
      {
        mesh: f.mesh.pyramid(),
        uniforms: {
          color: f.colors.YELLOW,
        },
        transform: {
          scale: [1.0, 1.0, 1.5],
          translate: [0, 0, -0.01],
        },
      },
    )
    .createNode(
      async () => ({
        mesh: await createTexturedCar(f)(CAR_COLORS.RED),
        transform: {
          rotate: [0, 0, toRadians(180)],
          scale: [0.25, 0.25, -0.25],
          translate: [3, 3, -0.65],
        },
      }),
    )
    .createNode(
      async () => ({
        mesh: await createTexturedCar(f)(CAR_COLORS.BLUE),
        transform: {
          rotate: [0, 0, toRadians(180)],
          scale: [0.2, 0.25, -0.25],
          translate: [3, 4.5, -0.65],
        },
      }),
    )
    .createNode(
      async () => ({
        mesh: await createTexturedTree(f),
        transform: {
          rotate: [0, 0, toRadians(180)],
          scale: [0.25, 0.25, -0.25],
          translate: [4, 6, -2],
        },
      }),
    );

  frame(scene.render);
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
