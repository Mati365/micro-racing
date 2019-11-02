import * as R from 'ramda';

import {OBJECT_TYPES} from '@game/network/constants/serverCodes';
import PALETTE from '@pkg/isometric-renderer/FGL/core/constants/colors';

import segmentizePath from '@game/logic/track/TrackSegments/utils/segmentizePath';
import {Vector} from '@pkg/gl-math';

import {
  drawPoints,
  drawTriangles,
} from '@pkg/ctx';

import {
  MapElement,
  RoadMapElement,
} from '@game/shared/map';

import TrackPath, {
  TRACK_POINTS,
  CHUNK_SIZE,
  getHandlerSiblingParentPoint,
} from '@game/logic/track/TrackPath';

import AbstractDraggableEditorLayer from './AbstractDraggableEditorLayer';

/**
 * It should be outside track, track is just container holding
 * data and adds data to it. Functional bassed approach should
 * be slow
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Rect} area
 * @param {Track} track
 */
const renderTrack = ({
  segmentize = true,
  spacing = 40,
  colors = {
    points: '#0000ff',
    segments: '#666',
  },
} = {}) => (ctx, track) => {
  const {path, realPointsLength} = track;
  const looped = realPointsLength > 2;

  // Render curve lines
  if (realPointsLength >= 2) {
    const interpolated = track.getInterpolatedPathPoints(
      {
        spacing,
      },
    );

    drawPoints(colors.points, 3, interpolated, ctx);

    if (looped && segmentize) {
      const {segments} = segmentizePath(
        {
          width: 20,
        },
        interpolated,
      );

      segments.forEach((segment) => {
        drawTriangles(colors.segments, 1, segment.triangles, ctx);
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

export default class TrackLayer extends AbstractDraggableEditorLayer {
  constructor({track} = {}) {
    super('Track Layer');

    this.track = track;
    this.sceneMeta = {
      segmentWidth: 2.5,
      transform: {
        scale: [0.1, 0.1, 1.0],
        translate: [0.0, 0.0, -0.01],
      },
    };

    this.focused = null;

    this.setActionHandlers(
      {
        handleClick: this.handleClick,
        findElementByCoords: this.findElementByCoords,
        updateElementPos: this.updateElementPos,
        removeElement: this.removeElement,
      },
    );
  }

  setCanvas(canvasConfig) {
    super.setCanvas(canvasConfig);

    if (!this.track) {
      this.track = TrackPath.fromRandomPath(
        R.mapObjIndexed(
          R.multiply(0.5),
          this.dimensions,
        ),
        false,
      );
      this.render();
    }
  }

  fromBSON([roadMapElement]) {
    const {points, sceneMeta} = roadMapElement.params;

    this.sceneMeta = sceneMeta;
    this.track = new TrackPath(
      R.map(
        Vector.fromArray,
        points,
      ),
    );

    this.render();
  }

  toBSON() {
    return [
      new RoadMapElement(
        this.track.getRealPathPoints(),
        this.sceneMeta,
      ),
      new MapElement(
        OBJECT_TYPES.TERRAIN,
        {
          transform: {
            scale: [64.0, 64.0, 1.0],
          },
          size: {
            w: 64,
            h: 64,
          },
          items: R.times(
            () => ({
              uv: [1, 0],
            }),
            64 * 64,
          ),
        },
      ),

      new MapElement(
        OBJECT_TYPES.PRIMITIVE,
        {
          name: 'plainTerrainWireframe',
          constructor: {
            w: 64,
            h: 64,
          },
          uniforms: {
            color: PALETTE.DARK_GRAY,
          },
          transform: {
            scale: [64.0, 64.0, 1.0],
          },
        },
      ),
    ];
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

  handleClick = (coords) => {
    const {draggingElement} = this;
    if (draggingElement)
      return;

    this.appendTrackPoint(coords);
  };

  findElementByCoords = coords => this.track.findPathPoint(10, coords);

  updateElementPos = (element, pos) => {
    const {track} = this;

    track.updatePointPos(
      element.index,
      pos,
    );
  }

  removeElement = (element) => {
    const {track} = this;
    track.removePoint(element.item);
  }

  render() {
    const {
      track,
      ctx,
    } = this;

    super.render();

    if (track)
      renderTrack()(ctx, track);
  }
}
