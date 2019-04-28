import * as R from 'ramda';
import React, {
  useRef,
  useEffect,
  useMemo,
} from 'react';

import {vec2} from '@pkg/gl-math/matrix';
import deCasteljau from './utils/deCasteljau';

import Track, {
  TRACK_POINTS,
  CHUNK_SIZE,
  getHandlerSiblingParentPoint,
} from './Track';

const relativeEventPos = (e) => {
  const bounds = e.target.getBoundingClientRect();

  return vec2(
    e.clientX - bounds.x,
    e.clientY - bounds.y,
  );
};

/**
 * It should be outside track, track is just container holding
 * data and adds data to it. Functional bassed approach should
 * be slow
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Rect} area
 * @param {Track} track
 */
const renderTrack = (ctx, {area, step = 0.05}, track) => {
  const {path, realPointsLength} = track;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, area.w, area.h);

  // Render curve lines
  //    +0           +1              +2          +3           +4            +5          +6
  // [normal] [handler before]  [handler after] [normal] [handler before] [normal] [handler before]
  if (realPointsLength >= 2) {
    let points = [];

    for (let j = 0; j < path.length - CHUNK_SIZE; j += CHUNK_SIZE) {
      points = points.concat(
        deCasteljau(
          {
            step,

            points: [
              path[j].point, // A
              path[j + CHUNK_SIZE].point, // B
            ],

            handlers: [
              path[j + CHUNK_SIZE - 1].point, // A top handler
              path[j + CHUNK_SIZE + 1].point, // B top handler
            ],
          },
        ),
      );
    }

    // loop, connects last to first
    points = points.concat(
      deCasteljau(
        {
          step,

          points: [
            path[0].point, // A
            path[path.length - CHUNK_SIZE].point, // B
          ],

          handlers: [
            path[1].point, // B top handler
            path[path.length - 1].point, // A top handler
          ],
        },
      ),
    );

    for (let i = points.length - 1; i >= 0; --i) {
      const [x, y] = points[i];

      ctx.fillStyle = '#0000ff';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  // Render points
  // -1 is loop trick
  for (let i = path.length - 1; i >= 0; --i) {
    const {focused, active, point, type} = path[i];
    const [x, y] = point;

    if (type === TRACK_POINTS.CURVE_HANDLER) {
      // draw line between parent
      const parent = getHandlerSiblingParentPoint(i, path);

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
      // get active color
      let color = null;
      if (active)
        color = '#00ff00';
      else if (focused)
        color = '#ffff00';
      else
        color = '#ff0000';

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

  focusedElement = null;

  constructor() {
    this.handlers = {
      click: this.onClickItemAdd,
      keydown: this.onKeydown,
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

  setFocused(point) {
    // focus is not cleared after drag
    if (this.focused)
      this.focused.item.focused = false;

    this.focused = point;
    point.item.focused = true;
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

      this.setFocused(trackPoint);
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

  onKeydown = (e) => {
    const {track, focused} = this;

    // delete
    if (e.keyCode === 46 && focused) {
      track.removePoint(
        focused.item,
      );
      this.render();
    }
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
    renderTrack(
      ctx,
      {
        area: dimensions,
      },
      track,
    );
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
      tabIndex={-1}
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
