import React, {useRef, useEffect} from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';

import fgl, {createIsometricProjection} from '@pkg/isometric-renderer';
import {createSingleResourceLoader} from '@pkg/resource-pack-loader';
import {mat4} from '@pkg/gl-math/matrix';

import cubeObjUrl from '@game/res/model/box/mesh.obj';
import cubeTextureUrl from '@game/res/model/box/tex.png';

import atlasImageUrl from '@game/res/img/atlas.png';
import attachRoadmapGenerator from '@game/shared/attachRoadmapGenerator';

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

const createTexturedBox = async (f) => {
  const {vao} = f.loaders.mesh.obj(
    await createSingleResourceLoader()(cubeObjUrl),
  );

  const image = await createSingleResourceLoader()(cubeTextureUrl);
  return f.mesh(
    {
      renderMode: f.flags.TRIANGLES,
      material: f.material.textureSprite,
      textures: [
        f.texture2D(
          {
            image,
          },
        ),
      ],
      vao,
    },
  );
};

const attachEngine = async (virtualResolution, dimensions, canvas) => {
  const f = fgl(canvas);

  // Matrices
  const projection = createIsometricProjection(virtualResolution, dimensions);
  const camera = mat4.from.translation([0.0, 0.0, 0.5]);

  const mpMatrix = mat4.compose.mul(
    mat4.from.scaling([
      0.2,
      0.2,
      0.2,
    ]),
    camera,
    projection,
  );

  const terrainWireframe = f.mesh.plainTerrainWireframe(
    {
      w: 5,
      h: 5,
    },
  );

  const texturedBox = await createTexturedBox(f);
  const terrain = await createTerrain(f);
  const pyramid = f.mesh.pyramid();
  // const box = f.mesh.box();
  // const boxBatch = f.mesh.batch(
  //   {
  //     mesh: box,
  //   },
  // );

  f.frame(() => {
    terrainWireframe(
      {
        uniforms: {
          color: f.colors.DARK_GRAY,
          mpMatrix: mat4.mul(
            mpMatrix,
            mat4.from.scaling([5.0, 5.0, 1.0]),
          ).array,
        },
      },
    );

    terrain(
      {
        uniforms: {
          mpMatrix: mat4.mul(
            mpMatrix,
            mat4.from.scaling([5.0, 5.0, 1.0]),
          ).array,
        },
      },
    );

    // boxBatch.batch(
    //   {
    //     uniforms: {
    //       color: f.colors.GREEN,
    //       mpMatrix: mat4.compose.mul(
    //         mat4.from.translation([2.0, 2.0, -0.01]),
    //         mat4.from.scaling([1.0, 1.0, 1.5]),
    //         mpMatrix,
    //       ).array,
    //     },
    //   },
    // );

    // boxBatch.batch(
    //   {
    //     uniforms: {
    //       color: f.colors.RED,
    //       mpMatrix: mat4.compose.mul(
    //         mat4.from.translation([3, 4, -0.01]),
    //         mat4.from.scaling([1.0, 1.0, 1.5]),
    //         mpMatrix,
    //       ).array,
    //     },
    //   },
    // );

    // boxBatch();

    texturedBox(
      {
        uniforms: {
          // color: f.colors.YELLOW,
          mpMatrix: mat4.compose.mul(
            mat4.from.scaling([0.5, 0.5, 0.5]),
            mat4.from.translation([0, 2, -1]),
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
            mat4.from.translation([3, 2, -0.01]),
            mpMatrix,
          ).array,
        },
      },
    );
  });
};

const GameCanvas = ({dimensions}) => {
  const canvasRef = useRef();
  const roadRef = useRef();

  useEffect(
    () => {
      attachEngine(
        {
          w: 640,
          h: 550,
        },
        dimensions,
        canvasRef.current,
      );

      attachRoadmapGenerator(
        dimensions,
        roadRef.current,
      );
    },
    [],
  );

  return (
    <>
      <canvas
        ref={canvasRef}
        width={dimensions.w}
        height={dimensions.h}
      />

      <canvas
        ref={roadRef}
        width={dimensions.w}
        height={dimensions.h}
        style={{
          marginLeft: 10,
        }}
      />
    </>
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
