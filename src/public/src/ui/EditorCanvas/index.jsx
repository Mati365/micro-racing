import * as R from 'ramda';
import React, {
  useRef,
  useEffect,
  useMemo,
} from 'react';

import {vec2} from '@pkg/gl-math/matrix';
import deCasteljau from './utils/deCasteljau';

const isPointInsideRect = (point, rect) => (
  point.x > rect.x
    && point.x < rect.x + rect.w
    && point.y > rect.y
    && point.y < rect.y + rect.h
);

const relativeEventPos = (e) => {
  const bounds = e.target.getBoundingClientRect();

  return vec2(
    e.clientX - bounds.x,
    e.clientY - bounds.y,
  );
};

/**
 * Point creators
 */
export const TRACK_POINTS = {
  CURVE_HANDLER: 1,
  PATH_POINT: 2,
};

const createTypedTrackPoint = type => point => ({
  type,
  point,
});

const createPoint = createTypedTrackPoint(TRACK_POINTS.PATH_POINT);
const createCurveHandlerPoint = createTypedTrackPoint(TRACK_POINTS.CURVE_HANDLER);

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
const getSiblingParentPoint = (index, path) => {
  const next = path[index - 1];
  if (next?.type === TRACK_POINTS.PATH_POINT)
    return next;

  const prev = path[index - 2];
  if (prev?.type === TRACK_POINTS.PATH_POINT)
    return prev;

  return null;
};
/**
 * Hold whole track related data shit
 */
class Track {
  path = [];

  appendPoint(vec) {
    const {path} = this;

    path.push(
      createPoint(vec),
    );

    /** Appends two curve handlers */
    path.push(
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
  }

  updatePointPos(index, vec) {
    const {path} = this;
    const item = this.path[index];
    if (!item)
      return;

    if (item.type === TRACK_POINTS.CURVE_HANDLER) {
      // make previous / next curve handler act as mirror
      const mirrorItem = getSiblingCurveHandler(index, path);
      const parentItem = getSiblingParentPoint(index, path);

      if (mirrorItem && parentItem) {
        const delta = vec2.sub(
          parentItem.point,
          vec,
        );

        mirrorItem.point = vec2.add(
          parentItem.point,
          delta,
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
        : {
          item: path[index],
          index,
        }
    );
  }
}

/**
 * It should be outside track, track is just container holding
 * data and adds data to it. Functional bassed approach should
 * be slow
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Rect} area
 * @param {Track} track
 */
const renderTrack = (ctx, area, track) => {
  const {path} = track;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, area.w, area.h);

  // Render curve lines
  //    +0           +1              +2          +3           +4            +5          +6
  // [normal] [handler before]  [handler after] [normal] [handler before] [normal] [handler before]
  if (path.length >= 6) {
    let points = [];

    for (let j = 0; j < path.length - 3; j += 3) {
      points = points.concat(
        deCasteljau(
          {
            step: 0.05,

            points: [
              path[j].point, // A
              path[j + 3].point, // B
            ],

            handlers: [
              path[j + 2].point, // A top handler
              path[j + 4].point, // B top handler
            ],
          },
        ),
      );
    }

    for (let i = points.length - 1; i >= 0; --i) {
      const [x, y] = points[i];

      ctx.fillStyle = '#0000ff';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  // Render points
  for (let i = path.length - 1; i >= 0; --i) {
    const {active, point, type} = path[i];
    const [x, y] = point;
    const color = (
      active
        ? '#00ff00'
        : '#ff0000'
    );

    if (type === TRACK_POINTS.CURVE_HANDLER) {
      // draw line between parent
      const parent = getSiblingParentPoint(i, path);

      // dirty hack - prevent overlapping parent point and render it again
      if (parent) {
        const {point: pPoint} = parent;

        ctx.strokeStyle = '#666666';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(pPoint.x, pPoint.y);
        ctx.stroke();
      }

      // outline circle
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = '#000000';

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    } else {
      // normal circle of path
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
};

/**
 * Creates handler that handles IO, it is much faster
 * than webpack tree
 */
class TrackEditor {
  canvas = null;

  ctx = null;

  dimensions = null;

  track = new Track;

  draggingElement = null;

  constructor() {
    this.handlers = {
      click: this.onClickItemAdd,
      mousemove: this.onDragMove,
      mousedown: this.onDragStart,
      mouseup: this.onDragEnd,
    };
  }

  mapCanvasHandlers(canvas, remove = false) {
    if (!canvas)
      return false;

    R.forEachObjIndexed(
      (handler, eventName) => {
        (::canvas[remove ? 'removeEventListener' : 'addEventListener'])(eventName, handler);
      },
      this.handlers,
    );

    return true;
  }

  setCanvas({
    canvas,
    dimensions,
  }) {
    this.mapCanvasHandlers(canvas, true);

    this.canvas = canvas;
    this.dimensions = dimensions;
    this.ctx = canvas.getContext('2d');

    // first render
    this.mapCanvasHandlers(canvas, false);
    this.render();
  }

  appendTrackPoint(vec) {
    this.track.appendPoint(vec);
    this.render();
  }

  /**
   * Append item handler
   */
  onClickItemAdd = (e) => {
    const {draggingElement} = this;
    if (draggingElement)
      return;

    this.appendTrackPoint(
      relativeEventPos(e),
    );
  };

  /**
   * Drag item
   */
  onDragStart = (e) => {
    const {track} = this;
    const trackPoint = track.findPathPoint(5, relativeEventPos(e)) || null;

    this.draggingElement = trackPoint;
    if (trackPoint) {
      trackPoint.item.active = true;
      this.render();
    }
  };

  onDragMove = (e) => {
    const {
      track,
      draggingElement,
      suppressMove,
    } = this;

    if (!draggingElement || suppressMove)
      return;

    track.updatePointPos(
      draggingElement.index,
      relativeEventPos(e),
    );

    this.render();
  };

  onDragEnd = () => {
    // cleanup stuff
    const {draggingElement} = this;
    if (draggingElement) {
      draggingElement.item.active = false;
      this.render();
    }

    // due to prevent default click handler issues add timer
    this.suppressMove = true;
    setTimeout(
      () => {
        this.suppressMove = false;
        this.draggingElement = null;
      },
      100,
    );
  };

  render() {
    const {
      track,
      ctx,
      dimensions,
    } = this;

    // cleanup
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, dimensions.w, dimensions.h);

    // draw board
    renderTrack(ctx, dimensions, track);
  }
}

const useTrackEditor = () => useMemo(
  () => new TrackEditor,
  [],
);

/**
 * Render editor stuff
 *
 * @export
 */
const EditorCanvas = ({dimensions}) => {
  const roadRef = useRef();
  const editor = useTrackEditor();

  useEffect(
    () => {
      editor.setCanvas(
        {
          canvas: roadRef.current,
          dimensions,
        },
      );
    },
    [],
  );

  return (
    <canvas
      ref={roadRef}
      width={dimensions.w}
      height={dimensions.h}
      style={{
        marginLeft: 10,
      }}
    />
  );
};

EditorCanvas.displayName = 'EditorCanvas';

export default EditorCanvas;
