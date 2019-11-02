import BSON from 'bson';
import * as R from 'ramda';

import * as Layers from './Layers';

/**
 * Creates handler that handles IO, it is much faster
 * than webpack tree
 */
export default class TrackEditor {
  layers = {
    track: new Layers.TrackLayer,
  };

  mapLayers(fn) {
    const {layers} = this;

    return R.mapObjIndexed(fn, layers);
  }

  setCanvas(canvasParams) {
    this.mapLayers(layer => layer.setCanvas(canvasParams));
  }

  toBSON(meta) {
    return BSON.serialize(
      {
        meta,
        layers: this.mapLayers(layer => layer.toBSON()),
      },
    );
  }

  fromBSON(bson) {
    const {layers, meta} = BSON.deserialize(bson);

    this.mapLayers(
      (layer, key) => layer.fromBSON(layers[key]),
    );

    return {
      layers,
      meta,
    };
  }
}
