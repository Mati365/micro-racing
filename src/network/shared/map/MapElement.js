import uniqid from 'uniqid';

import {createPackedStruct} from '@pkg/struct-pack';

export default class MapElement {
  constructor(type, params, id = uniqid()) {
    this.type = type;
    this.id = id;

    if (params)
      this.params = params;
  }

  static binarySnapshotSerializer = createPackedStruct(
    {
      align: 'plain',
      wrapToType: false,
      fields: {
        type: {
          type: 'int8',
        },
        id: {
          type: 'int16',
        },
      },
    },
  );
}
