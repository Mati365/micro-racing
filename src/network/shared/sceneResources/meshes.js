import {Size} from '@pkg/gl-math';

import basicBarrierTexUrl from '@game/res/model/barriers/basic/tex.png';
import barrierResourceUrl from '@game/res/model/barriers/basic/basic-barrier.obj';

import URLMeshResourceMeta from './types/URLMeshResourceMeta';

/* eslint-disable import/prefer-default-export */
export const BARRIER_MESHES = {
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
