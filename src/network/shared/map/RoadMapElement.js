import {OBJECT_TYPES} from '@game/network/constants/serverCodes';

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
    const {points, sceneMeta} = this.params;

    return new TrackSegments(
      {
        ...sceneMeta, // sceneWidth
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
