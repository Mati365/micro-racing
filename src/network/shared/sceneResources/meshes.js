import {Size} from '@pkg/gl-math';

import basicBarrierTexUrl from '@game/res/model/barriers/basic/tex.png';
import barrierResourceUrl from '@game/res/model/barriers/basic/basic-barrier.obj';

import URLMeshResourceMeta from './types/URLMeshResourceMeta';

import {CARS_RESOURCES} from './cars';

export const BARRIERS_RESOURCES = {
  BASIC: new URLMeshResourceMeta(
    {
      url: barrierResourceUrl,
      normalizedSize: new Size(0.4625033788784572, 1.0, 0.4106471677238611),
      textures: [
        basicBarrierTexUrl,
      ],
    },
  ),
};

export const MESHES = {
  BARRIERS: BARRIERS_RESOURCES,
  CARS: CARS_RESOURCES,
};
