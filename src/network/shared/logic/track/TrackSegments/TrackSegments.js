import transformSegmentizePath from './utils/transformSegmentizePath';

export default class TrackSegments {
  constructor({
    segmentWidth,
    interpolatedPath,
    transform = null,
  }) {
    const {path, innerPath, outerPath, segments} = transformSegmentizePath(
      {
        segmentizeParams: {
          width: segmentWidth,
        },
        transform,
        path: interpolatedPath,
      },
    );

    this.segments = segments;
    this.path = path;
    this.innerPath = innerPath;
    this.outerPath = outerPath;
  }
}
