import * as R from 'ramda';

import {OBJECT_TYPES} from '@game/network/constants/serverCodes';

import {CornersBox, Edge} from '@pkg/gl-math';
import TrackPath from '@game/logic/track/TrackPath/TrackPath';
import TrackSegments from '@game/logic/track/TrackSegments/TrackSegments';

import MapElement from './MapElement';

export default class RoadMapElement extends MapElement {
  constructor(points, sceneMeta) {
    super(
      OBJECT_TYPES.ROAD,
      {
        points,
        sceneMeta,
      },
    );
  }

  getSegmentsInfo() {
    const {
      points,
      sceneMeta: {box, checkpoints, ...sceneMeta},
    } = this.params;

    return new TrackSegments(
      {
        ...sceneMeta, // sceneWidth
        checkpoints: R.map(Edge.fromBSON, checkpoints),
        box: CornersBox.fromBSON(box),
        interpolatedPath: new TrackPath(points).getInterpolatedPathPoints(),
      },
    );
  }

  static fromBSON({params: {points, sceneMeta}}) {
    return new RoadMapElement(
      points,
      sceneMeta,
    );
  }
}
