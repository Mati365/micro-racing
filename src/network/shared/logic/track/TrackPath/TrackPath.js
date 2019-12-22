import * as R from 'ramda';
import {vec2} from '@pkg/gl-math/matrix';

import {filterMap} from '@pkg/basic-helpers';

import {
  interpolateEditorPath,
  generateRandomPath,
} from './utils';

const isPointInsideRect = (point, rect) => (
  point.x > rect.x
    && point.x < rect.x + rect.w
    && point.y > rect.y
    && point.y < rect.y + rect.h
);

export const CURVE_CHUNK_SIZE = 3;

/**
 * Point creators
 */
export const TRACK_POINTS = {
  CURVE_HANDLER: 1,
  PATH_POINT: 2,
};

const createPoint = point => ({
  type: TRACK_POINTS.PATH_POINT,
  point,
});

const createCurveHandlerPoint = (point, size = 1.0, mirror = true) => ({
  type: TRACK_POINTS.CURVE_HANDLER,
  point,
  size,
  mirror,
});

/**
 * @see
 * Path layout:
 * [item] [handler] [handler] [item] [handler] [handler]
 *
 * Fast find sibling handler
 */
const getSiblingCurveHandler = (index, path) => {
  const next = path[index + 1];
  if (next?.type === TRACK_POINTS.CURVE_HANDLER)
    return next;

  const prev = path[index - 1];
  if (prev?.type === TRACK_POINTS.CURVE_HANDLER)
    return prev;

  return null;
};

/**
 * Fast find sibling handler
 */
export const getHandlerSiblingParentPoint = (index, path) => {
  const next = path[index - 1];
  if (next?.type === TRACK_POINTS.PATH_POINT)
    return next;

  const prev = path[index - 2];
  if (prev?.type === TRACK_POINTS.PATH_POINT)
    return prev;

  return null;
};

/**
 * Getter from tack item
 *
 * @param {Vec2} item
 * @param {Number} index
 */
export const createPointResultDescriptor = (item, index) => ({
  item,
  index,
});

/**
 * Hold whole track related data shit
 */
export default class TrackPath {
  path = [];

  constructor(
    points = [],
    autoposCurveHandlers = true,
  ) {
    this.autoposCurveHandlers = autoposCurveHandlers;
    R.forEach(::this.appendPoint, points);
  }

  static fromRandomPath(config = {w: 640, h: 480}, ...args) {
    return new TrackPath(
      generateRandomPath(config, ...args),
    );
  }

  /**
   * Returns track length without moveable curve handlers
   */
  get realPointsLength() {
    const {path} = this;
    return path.length / CURVE_CHUNK_SIZE;
  }

  /**
   * Append point with path to path
   *
   * @param {Vec2} vec
   * @param {Number} index
   */
  appendPoint(vec, index) {
    const {autoposCurveHandlers, path} = this;
    const point = createPoint(vec);
    const insertIndex = R.defaultTo(path.length, index);

    /** Appends two curve handlers */
    path.splice(
      insertIndex,
      0,

      // items
      point,
      createCurveHandlerPoint(
        vec2.add(
          vec2(-30, 0),
          vec,
        ),
      ),
      createCurveHandlerPoint(
        vec2.add(
          vec2(30, 0),
          vec,
        ),
      ),
    );

    if (autoposCurveHandlers)
      this.updateHandlersPos();

    return createPointResultDescriptor(point, insertIndex);
  }

  /**
   * Automatic calculation of handlers
   *
   * [item] [handler] [handler] [item] [handler] [handler]
   *
   * @see {@link https://www.youtube.com/watch?v=nNmFLWup4_k&t=469s}
   */
  updateHandlersPos() {
    const {path, realPointsLength} = this;

    if (realPointsLength < CURVE_CHUNK_SIZE)
      return;

    // starts from 1 to prevent glitches
    for (
      let i = realPointsLength > 1 ? 0 : CURVE_CHUNK_SIZE;
      i < path.length;
      i += CURVE_CHUNK_SIZE
    ) {
      const [prev, current, next] = [
        path[i - CURVE_CHUNK_SIZE]?.point || path[path.length - 1]?.point, // looping
        path[i].point,
        path[i + CURVE_CHUNK_SIZE]?.point || path[0]?.point, // looping
      ];
      if (!prev)
        continue;

      // delte vector from prev point
      const deltaPrev = vec2.sub(prev, current);
      const deltaNext = vec2.sub(next, current);

      const orthoVec = vec2.normalize(
        vec2.sub(
          deltaNext,
          deltaPrev,
        ),
      );

      // current point curve handlers
      path[i + 1].point = vec2.sub(
        current,
        vec2.mul(vec2.len(deltaPrev) / 2, orthoVec),
      );

      path[i + 2].point = vec2.add(
        current,
        vec2.mul(vec2.len(deltaNext) / 2, orthoVec),
      );
    }
  }

  /**
   * Removes point with handlers from path
   *
   * @param {Vec2} vec
   */
  removePoint(vec) {
    const {path} = this;
    const index = path.indexOf(vec);
    if (index === -1)
      return;

    this.path = R.remove(index, 3, path);
    this.updateHandlersPos();
  }

  /**
   * Updates position point provided via index, sets vec
   *
   * @param {Number}  index
   * @param {Vec2}    vec
   */
  updatePointPos(index, vec) {
    const {path} = this;
    const item = this.path[index];
    if (!item)
      return;

    if (item.type === TRACK_POINTS.CURVE_HANDLER) {
      // make previous / next curve handler act as mirror
      const mirrorItem = getSiblingCurveHandler(index, path);
      const parentItem = getHandlerSiblingParentPoint(index, path);

      // not all points allow to mirror
      if (mirrorItem?.mirror && parentItem) {
        const delta = vec2.sub(
          parentItem.point,
          vec,
        );

        mirrorItem.point = vec2.add(
          parentItem.point,
          vec2.mul(mirrorItem.size / item.size, delta),
        );
      }
    } else if (item.type === TRACK_POINTS.PATH_POINT) {
      // update elements position when point moves
      // [item] [handler] [handler]
      const [firstHandler, secondHandler] = [path[index + 1], path[index + 2]];
      const delta = vec2.sub(
        item.point,
        firstHandler.point,
      );

      firstHandler.point = vec2.sub(vec, delta);
      secondHandler.point = vec2.add(vec, delta);
    }

    item.point = vec;
    this.updateHandlersPos();
  }

  findPathPoint(margin, pos) {
    const {path} = this;
    const index = R.findIndex(
      ({point}) => (
        isPointInsideRect(
          pos,
          {
            x: point.x - margin,
            y: point.y - margin,
            w: margin * 2,
            h: margin * 2,
          },
        )
      ),
      this.path,
    );

    return (
      index === -1
        ? null
        : createPointResultDescriptor(path[index], index)
    );
  }

  /**
   * Return beizer interpolated points
   *
   * @param {Object} config
   *
   * @see
   *  Very slow!
   */
  getInterpolatedPathPoints(config) {
    const {path, realPointsLength} = this;

    return interpolateEditorPath(
      {
        spacing: 10,
        loop: realPointsLength > 2,
        chunkSize: CURVE_CHUNK_SIZE,
        selectorFn: R.prop('point'),
        ...config,
      },
      path,
    );
  }

  /**
   * Return track points without curve handlers
   *
   * @returns {Vector3[]}
   */
  getRealPathPoints() {
    return filterMap(
      R.ifElse(
        R.propEq('type', TRACK_POINTS.PATH_POINT),
        R.prop('point'),
        R.always(null),
      ),
      this.path,
    );
  }
}
