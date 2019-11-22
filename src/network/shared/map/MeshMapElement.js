import {requiredParam} from '@pkg/basic-helpers';

import MapElement from './MapElement';

import {OBJECT_TYPES} from '../../constants/serverCodes';

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
  }
}
