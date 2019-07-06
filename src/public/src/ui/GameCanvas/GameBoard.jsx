import {useMemo} from 'react';

import atlasImageUrl from '@game/res/img/atlas.png';

import {toRadians} from '@pkg/gl-math';
import {createIsometricScene} from '@pkg/isometric-renderer';
import {MeshNode} from '@pkg/isometric-renderer/FGL/engine/scene/types';

import generateTerrain from './utils/generateTerrain';
import createTexturedCar, {CAR_COLORS} from './utils/createTexturedCar';
import createTexturedTree from './utils/createTexturedTree';

import {
  CarNode,
  RoadNode,
} from './Objects';

const ROTATE_CAR_SPEED = toRadians(1);

/**
 * Blender config:
 * -Y forward
 * -Z up
 */
const createBasicScene = (f) => {
  const scene = f.createSceneBuffer();
  scene
    .chain
    // .createLight(
    //   {
    //     pos: [7, 6, -7],
    //     diffuseColor: [1, 1, 1],
    //     diffuseIntensity: 0.7,
    //   },
    // )
    // .createLight(
    //   {
    //     pos: [2, 8, -1],
    //     diffuseColor: [1, 0, 1],
    //     diffuseIntensity: 0.7,
    //   },
    // )
    // .createLight(
    //   {
    //     pos: [2, 2, -1],
    //     diffuseColor: [1, 1, 0],
    //     diffuseIntensity: 1.0,
    //   },
    // )
    .createNode(
      {
        renderer: f.mesh.plainTerrainWireframe(
          {
            w: 64,
            h: 64,
          },
        ),
        uniforms: {
          color: f.colors.DARK_GRAY,
        },
        transform: {
          scale: [64.0, 64.0, 1.0],
        },
      },
    )
    .createNode(
      async () => ({
        renderer: await generateTerrain(f)(
          {
            atlasImageUrl,
            atlasSize: {
              w: 5,
              h: 5,
            },
            size: {
              w: 64,
              h: 64,
            },
          },
        ),
        transform: {
          scale: [64.0, 64.0, 1.0],
        },
      }),
    )
    .createNode(
      {
        renderer: f.mesh.box(),
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
        renderer: f.mesh.pyramid(),
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
      async () => new MeshNode(
        {
          renderer: await createTexturedTree(f),
          transform: {
            rotate: [0, 0, toRadians(180)],
            scale: [0.25, 0.25, 0.25],
            translate: [4, 6, 0],
          },
          f,
        },
      ),
    );

  return scene;
};

export default class GameBoard {
  keyMap = {};

  async setCanvas({canvas, dimensions, aspectRatio, track}) {
    this.canvas = canvas;
    this.dimensions = dimensions;
    this.engine = createIsometricScene(
      {
        canvas,
        aspectRatio,
      },
    );

    canvas.addEventListener('keydown', (e) => { this.keyMap[e.which] = true; }, true);
    canvas.addEventListener('keyup', (e) => { this.keyMap[e.which] = false; }, true);

    const {f} = this.engine;
    this.scene = createBasicScene(f);

    this.road = await this.scene.createNode(
      () => new RoadNode(
        {
          f,
          track,
          uniforms: {
            color: f.colors.WHITE,
          },
          transform: {
            scale: [0.1, 0.1, 1.0],
            translate: [0.0, 0.0, -0.01],
          },
        },
      ),
    );

    const {segments} = this.road.pathInfo;
    this.car = await this.scene.createNode(
      async sceneParams => new CarNode(
        {
          ...sceneParams,
          renderer: await createTexturedCar(f)(CAR_COLORS.BLUE),
          transform: {
            rotate: [0, 0, segments[0].angle],
            scale: [1.25, 1.25, 1.25],
            translate: segments[0].point,
          },
        },
      ),
    );

    // for (let i = 0; i < 4; i += 2) {
    //   this.scene
    //     .chain
    //     .createNode(
    //       async sceneParams => new CarNode(
    //         {
    //           ...sceneParams,
    //           renderer: await createTexturedCar(f)(CAR_COLORS.RED),
    //           transform: {
    //             rotate: [0, 0, segments[i].angle],
    //             scale: [1.5, 1.5, 1.5],
    //             translate: vec3.add(
    //               segments[i].point,
    //               vec2.toVec3(
    //                 vec2.fromScalar(segments[i].width / 2, segments[i].angle),
    //                 0.0,
    //               ),
    //             ),
    //           },
    //         },
    //       ),
    //     )
    //     .createNode(
    //       async sceneParams => new CarNode(
    //         {
    //           ...sceneParams,
    //           renderer: await createTexturedCar(f)(CAR_COLORS.RED),
    //           transform: {
    //             rotate: [0, 0, segments[i].angle],
    //             scale: [1.5, 1.5, 1.5],
    //             translate: vec3.sub(
    //               segments[i].point,
    //               vec2.toVec3(
    //                 vec2.fromScalar(segments[i].width / 2, segments[i].angle),
    //                 0.0,
    //               ),
    //             ),
    //           },
    //         },
    //       ),
    //     );
    // }

    this.scene.camera.target = this.car;
    this.engine.frame(
      (delta, mpMatrix) => {
        this.update(delta);
        this.render(delta, mpMatrix);
      },
    );

    return this;
  }

  update(delta) {
    const {scene, car, keyMap} = this;

    // left
    if (keyMap[37])
      car.body.turn(-ROTATE_CAR_SPEED * delta);

    // right
    else if (keyMap[39])
      car.body.turn(ROTATE_CAR_SPEED * delta);

    // w
    if (keyMap[87])
      car.body.speedUp(2 * delta);

    // s
    if (keyMap[83])
      car.body.speedUp(-2 * delta);

    scene.update(delta);
  }

  render(delta, mpMatrix) {
    const {scene} = this;

    scene.render(delta, mpMatrix);
  }
}

export const useGameBoard = initialConfig => useMemo(
  () => new GameBoard(initialConfig),
  [],
);
