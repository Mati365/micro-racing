import BSON from 'bson';
import * as R from 'ramda';

import {OBJECT_TYPES} from '@game/network/constants/serverCodes';
import {findByProp} from '@pkg/basic-helpers/list/findByID';
import RoadMapElement from './RoadMapElement';

export const PREDEFINED_MAP_LAYERS = {
  TRACK: 'track',
};

export default class LayerMap {
  constructor(meta, layers) {
    this.meta = meta;
    this.layers = layers;
    this.roadElement = RoadMapElement.fromBSON(
      findByProp('type')(
        OBJECT_TYPES.ROAD,
        this.layers[PREDEFINED_MAP_LAYERS.TRACK],
      ),
    );
  }

  get objects() {
    return R.compose(
      R.unnest,
      R.values,
    )(this.layers);
  }

  toBSON() {
    const {meta, layers} = this;

    return BSON.serialize(
      {
        meta,
        layers,
      },
    );
  }

  static fromBSON(bson) {
    const {meta, layers} = BSON.deserialize(bson);

    return new LayerMap(
      meta,
      layers,
    );
  }
}
