import * as R from 'ramda';

import {relativeEventPos} from '@pkg/basic-helpers';

import TrackPath, {
  TRACK_POINTS,
  CHUNK_SIZE,
  getHandlerSiblingParentPoint,
} from '@game/logic/track/TrackPath';

import segmentizePath from '@game/logic/track/TrackSegments/utils/segmentizePath';

const drawPoints = (color, r, points, ctx) => {
  for (let i = points.length - 1; i >= 0; --i) {
    const [x, y] = points[i];

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  }
};

const drawTriangles = (color, lineWidth, triangles, ctx) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (let i = triangles.length - 1; i >= 0; --i) {
    const {a, b, c} = triangles[i];

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(a.x, a.y);
    ctx.stroke();
  }
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
const renderTrack = (ctx, {area, step = 0.2}, track) => {
  const {path, realPointsLength} = track;
  const looped = realPointsLength > 2;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, area.w, area.h);

  // Render curve lines
  if (realPointsLength >= 2) {
    const interpolated = track.getInterpolatedPathPoints(
      {
        step,
      },
    );

    drawPoints('#0000ff', 3, interpolated, ctx);

    if (looped) {
      const {segments} = segmentizePath(
        {
          width: 20,
        },
        interpolated,
      );

      segments.forEach((segment) => {
        drawTriangles('#666', 1, segment.triangles, ctx);
      });
    }
  }

  // Render points
  // -1 is loop trick
  for (let i = path.length - 1; i >= 0; --i) {
    const {focused, active, point, type} = path[i];
    const [x, y] = point;

    ctx.lineWidth = 1;

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

      // print index
      ctx.fillText(`#${Number.parseInt(i / CHUNK_SIZE, 10)}`, x, y - 10);
    }
  }
};

/**
 * Creates handler that handles IO, it is much faster
 * than webpack tree
 */
export default class TrackEditor {
  canvas = null;

  ctx = null;

  dimensions = null;

  track = null;

  draggingElement = null;

  focused = null;

  constructor({track} = {}) {
    this.track = track;
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

    if (!this.track)
      this.track = TrackPath.fromRandomPath(dimensions);

    // first render
    this.mapCanvasHandlers(canvas, false);
    this.render();
  }

  appendTrackPoint(vec) {
    const insertIndex = (
      this.focused
        ? this.focused.index + CHUNK_SIZE
        : null
    );

    this.setFocused(
      this.track.appendPoint(
        vec,
        insertIndex,
      ),
    );
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
    const trackPoint = track.findPathPoint(10, relativeEventPos(e)) || null;

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
