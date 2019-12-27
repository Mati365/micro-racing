import BSON from 'bson';
import {createCanvas} from 'canvas';

import {Size} from '@pkg/gl-math';

import prerenderMapThumbnail from '../shared/map/utils/prerenderMapThumbnail';
import LayerMap from '../shared/map/LayerMap';

export default class PrerenderedLayerMap extends LayerMap {
  constructor(layerMapConfig, {thumbnailSize = new Size(256, 256)} = {}) {
    super(layerMapConfig);

    const {roadElement} = this;
    this.thumbnailSize = thumbnailSize;
    this.thumbnail = prerenderMapThumbnail(
      {
        roadSegment: roadElement.getSegmentsInfo(),
      },
    )(
      createCanvas(thumbnailSize.w, thumbnailSize.h),
    ).canvas;
  }

  toListBSON() {
    const {id, meta, thumbnail} = this;

    return {
      ...meta,
      id,
      thumbnail: thumbnail.toDataURL(),
    };
  }

  static prerender(layerMap, prerenderConfig) {
    return new PrerenderedLayerMap(
      layerMap,
      prerenderConfig,
    );
  }

  static fromBSON(bson) {
    const {meta, layers} = BSON.deserialize(bson);

    return new PrerenderedLayerMap(
      {
        meta,
        layers,
      },
    );
  }
}
