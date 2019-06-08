import {useMemo} from 'react';

import atlasImageUrl from '@game/res/img/atlas.png';

import {toRadians} from '@pkg/gl-math';

import {createIsometricScene} from '@pkg/isometric-renderer';
import {MeshNode} from '@pkg/isometric-renderer/FGL/scene/types';

import generateTerrain from './utils/generateTerrain';
import createTexturedCar, {CAR_COLORS} from './utils/createTexturedCar';
import createTexturedTree from './utils/createTexturedTree';

import Car from './Objects/Car';

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
    .createNode(
      {
        renderer: f.mesh.plainTerrainWireframe(
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
        renderer: await generateTerrain(f)(
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
      async sceneParams => new Car({
        ...sceneParams,
        renderer: await createTexturedCar(f)(CAR_COLORS.RED),
        transform: {
          rotate: [0, 0, toRadians(90)],
          scale: [1.5, 1.5, 1.5],
          translate: [3, 3, 0.0],
        },
      }),
    )
    .createNode(
      async () => new MeshNode({
        renderer: await createTexturedTree(f),
        transform: {
          rotate: [0, 0, toRadians(180)],
          scale: [0.25, 0.25, 0.25],
          translate: [4, 6, 0],
        },
        f,
      }),
    );

  return scene;
};

export default class GameBoard {
  keyMap = {};

  async setCanvas({canvas, dimensions, aspectRatio}) {
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

    this.scene = createBasicScene(this.engine.f);
    this.car = await this.scene.createNode(
      async sceneParams => new Car(
        {
          ...sceneParams,
          renderer: await createTexturedCar(this.engine.f)(CAR_COLORS.BLUE),
          transform: {
            rotate: [0, 0, toRadians(-75)],
            scale: [1.25, 1.25, 1.25],
            translate: [2, 4.5, 0.0],
          },
        },
      ),
    );

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
      car.body.speedUp(0.001 * delta);

    // s
    if (keyMap[83])
      car.body.speedUp(-0.001 * delta);

    scene.update(delta);
  }

  render(delta, mpMatrix) {
    const {scene} = this;

    scene.render(delta, mpMatrix);
  }
}

export const useGameBoard = () => useMemo(
  () => new GameBoard,
  [],
);
