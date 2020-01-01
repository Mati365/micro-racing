import {MESHES} from '@game/shared/sceneResources/meshes';
import {OBJECT_TYPES} from '@game/network/constants/serverCodes';

import {vec2} from '@pkg/gl-math';
import {dig, requiredParam} from '@pkg/basic-helpers';

import PhysicsBody from '@pkg/physics-scene/src/types/PhysicsBody';
import MapElement from './MapElement';

export default class MeshMapElement extends MapElement {
  constructor(
    meshResPath = requiredParam('meshResPath'),
    params,
  ) {
    super(
      OBJECT_TYPES.MESH,
      {
        meshResPath,
        ...params,
      },
    );

    const {
      transform: {
        translate = [0, 0, 0],
        scale = [1, 1, 1],
        rotate = [0, 0, 0],
      },
    } = params;

    const {normalizedSize} = dig(meshResPath, MESHES);
    this.body = new PhysicsBody(
      {
        moveable: false,
        pos: vec2(translate[0], translate[1]),
        size: normalizedSize.scale(scale),
        angle: rotate[2],
      },
    );
  }

  static fromBSON({params}) {
    return new MeshMapElement(params.meshResPath, params);
  }
}
