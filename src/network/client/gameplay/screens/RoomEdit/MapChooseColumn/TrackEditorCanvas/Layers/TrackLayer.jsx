import * as R from 'ramda';

import {OBJECT_TYPES} from '@game/network/constants/serverCodes';
import {
  CRIMSON_RED,
  DODGER_BLUE,
  DARKEST_GRAY,
  GRASS_GREEN,
} from '@ui/colors';

import PALETTE from '@pkg/isometric-renderer/FGL/core/constants/colors';

import {
  segmentizePath,
  getExpandedPathCheckpoints,
  expandPath,
} from '@game/logic/track/TrackSegments/utils';

import {
  vec2, toRadians,
  getPathCornersBox,
  Vector, CornersBox,
} from '@pkg/gl-math';

import {
  drawLine,
  drawPoint,
  drawPoints,
  drawRect,
  drawTriangles,
} from '@pkg/ctx';

import {
  MapElement,
  MeshMapElement,
  RoadMapElement,
} from '@game/shared/map';

import TrackPath, {
  TRACK_POINTS,
  CURVE_CHUNK_SIZE,
  getHandlerSiblingParentPoint,
} from '@game/logic/track/TrackPath';

import AbstractDraggableEditorLayer from './AbstractDraggableEditorLayer';

class EditorMesh {
  constructor(meshResPath, angle, point) {
    this.meshResPath = meshResPath;
    this.angle = angle;
    this.point = point;
  }
}

const getTrackBarriers = (
  {
    points,
    scale = [1, 1],
    meshResPath = 'BARRIERS.BASIC',
    spacing = 20,
    width = 40,
  },
) => {
  const generateMeshes = (meshPoints) => {
    const meshes = [];
    let prevPoint = meshPoints[
      meshPoints.length - 1
    ];

    for (let i = 0; i < meshPoints.length; ++i) {
      let point = meshPoints[i];
      const nextPoint = meshPoints[(i + 1) % meshPoints.length];

      const dist = vec2.dist(prevPoint, point);
      if (dist >= spacing) {
        const missDist = dist - spacing;
        const prevPointVector = vec2.normalize(vec2.sub(prevPoint, point));

        point = vec2.add(point, vec2.mul(missDist, prevPointVector));
        prevPoint = point;

        meshes.push(
          new EditorMesh(
            meshResPath,
            vec2.vectorAngle(vec2.sub(nextPoint, prevPoint)),
            vec2(
              point.x * scale[0],
              point.y * scale[1],
            ),
          ),
        );
      }
    }

    return meshes;
  };

  const expandedPath = expandPath(width)(points);

  return {
    barriers: R.unnest(R.map(generateMeshes, expandedPath)),
    expandedPath,
  };
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
const renderTrack = ({
  segmentize = true,
  renderCheckpoints = false,
  colors = {
    points: DODGER_BLUE,
    segments: DARKEST_GRAY,
  },
  barrierSize = vec2(15, 8),
} = {}) => (ctx, track) => {
  const {path, realPointsLength} = track;
  const looped = realPointsLength > 2;

  // Render curve lines
  if (realPointsLength >= 2) {
    const interpolated = track.getInterpolatedPathPoints();

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

      // barriers
      const {barriers, expandedPath} = getTrackBarriers(
        {
          points: interpolated,
        },
      );

      barriers.forEach((barrier) => {
        drawPoint(
          CRIMSON_RED,
          2,
          barrier.point,
          ctx,
        );

        const cx = barrier.point.x;
        const cy = barrier.point.y;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(barrier.angle);
        ctx.translate(-cx, -cy);

        drawRect(
          {
            x: cx - barrierSize.x / 2,
            y: cy - barrierSize.y / 2,
            w: barrierSize.x,
            h: barrierSize.y,
          },
          2,
          GRASS_GREEN,
          ctx,
        );
        ctx.restore();
      });

      // checkpoints
      if (renderCheckpoints) {
        getExpandedPathCheckpoints()(expandedPath).forEach((edge) => {
          drawLine(
            edge.from,
            edge.to,
            CRIMSON_RED,
            1,
            ctx,
          );
        });
      }
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
        color = CRIMSON_RED;

      // normal circle of path
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();

      // print index
      ctx.fillText(`#${Number.parseInt(i / CURVE_CHUNK_SIZE, 10)}`, x, y - 10);
    }
  }
};

const renderSheet = ({
  dimensions,
  color = '#0f0f0f',
  spacing = vec2(40, 40),
}) => (ctx) => {
  const [from, to] = [vec2(0, 0), vec2(0, dimensions.h)];

  for (let i = 0; i < dimensions.w / spacing.x; ++i) {
    from.x += spacing.x;
    to.x += spacing.y;

    drawLine(
      from,
      to,
      color,
      1,
      ctx,
    );
  }

  from.x = 0;
  from.y = 0;

  to.x = dimensions.w;
  to.y = 0;

  for (let i = 0; i < dimensions.h / spacing.y; ++i) {
    from.y += spacing.x;
    to.y += spacing.y;

    drawLine(
      from,
      to,
      color,
      1,
      ctx,
    );
  }
};

export default class TrackLayer extends AbstractDraggableEditorLayer {
  constructor(
    {
      track,
      scale = 1.0,
      roadMapElement,
    } = {},
  ) {
    super('Track Layer');

    this.scale = scale;
    this.sceneMeta = {
      segmentWidth: 2.5,
      transform: {
        scale: [0.1, 0.1, 1.0],
        translate: [0.0, 0.0, -0.01],
      },
    };

    this.track = (
      roadMapElement
        ? () => this.fromBSON([roadMapElement])
        : track
    );

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

    const {track} = this;
    if (!track) {
      this.track = TrackPath.fromRandomPath(
        R.mapObjIndexed(
          R.multiply(0.8 / this.scale),
          this.dimensions,
        ),
        vec2(100, 100),
      );
      this.render();
    } else if (R.is(Function, track))
      track();
  }

  fromBSON([roadMapElement], centerize = true) {
    const {ctx, scale, dimensions} = this;
    const {points, sceneMeta} = roadMapElement.params;
    const parsedPoints = R.map(Vector.fromArray, points);

    if (centerize) {
      const {transform, box} = sceneMeta;
      const {width, height, topLeft} = CornersBox.fromBSON(box);

      const realScale = [
        transform.scale[0] / scale,
        transform.scale[1] / scale,
      ];

      R.forEach(
        (point) => {
          // move to left top corner
          point[0] -= topLeft[0] / realScale[0] + 30; // x
          point[1] -= topLeft[1] / realScale[1] + 30; // y

          // move to center
          point[0] += dimensions.w / 2 - width / 2 / realScale[0];
          point[1] += dimensions.h / 2 - height / 2 / realScale[1];
        },
        parsedPoints,
      );
    }

    this.sceneMeta = sceneMeta;
    this.track = new TrackPath(parsedPoints);

    if (ctx)
      this.render();

    return this.track;
  }

  toBSON() {
    const points = this.track.getRealPathPoints();
    const {transform} = this.sceneMeta;

    const interpolated = this.track.getInterpolatedPathPoints();
    const {
      barriers,
      expandedPath: expandedBarriersPath,
    } = getTrackBarriers(
      {
        scale: transform.scale,
        points: interpolated,
      },
    );

    const roadBox = getPathCornersBox(expandedBarriersPath[0]);
    const {topLeft, width, height} = roadBox;

    const terrainMargin = 80;
    const terrainTransform = {
      translate: [
        (topLeft.x - terrainMargin) * transform.scale[0],
        (topLeft.y - terrainMargin) * transform.scale[1],
        0.0,
      ],
      scale: [
        (width + terrainMargin * 2) * transform.scale[0],
        (height + terrainMargin * 2) * transform.scale[1],
        1.0,
      ],
    };

    const barriersMeshes = R.map(
      ({point, angle, meshResPath}) => new MeshMapElement(
        meshResPath,
        {
          moveable: false,
          transform: {
            rotate: [
              0, 0,
              angle + toRadians(90),
            ],
            translate: [point.x, point.y, 0],
            scale: [1.15, 1.15, 1.15],
          },
        },
      ),
      barriers,
    );

    return [
      new RoadMapElement(
        points,
        {
          ...this.sceneMeta,
          box: roadBox.scale(transform.scale),
          checkpoints: getExpandedPathCheckpoints(
            {
              scale: transform.scale,
            },
          )(expandedBarriersPath),
        },
      ),
      new MapElement(
        OBJECT_TYPES.TERRAIN,
        {
          transform: terrainTransform,
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
            w: 80,
            h: Math.floor(80 * height / width),
          },
          uniforms: {
            color: PALETTE.DARK_GRAY,
          },
          transform: terrainTransform,
        },
      ),

      ...barriersMeshes,
    ];
  }

  appendTrackPoint(vec) {
    const nearestIndex = R.compose(
      R.unless(
        R.isNil,
        ({p}) => R.findIndex(
          ({point}) => point === p,
          this.track.path,
        ),
      ),
      R.head,
      R.sortBy(R.prop('dist')),
      points => R.addIndex(R.map)(
        (p, index) => ({
          dist: vec2.dist(
            vec2.lerp(0.5, p, points[(index + 1) % points.length]),
            vec,
          ),
          p,
        }),
        points,
      ),
    )(
      this.track.getRealPathPoints(),
    );

    this.setFocused(
      this.track.appendPoint(
        vec,
        R.isNil(nearestIndex)
          ? null
          : nearestIndex + CURVE_CHUNK_SIZE,
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

    super.render(
      {
        prerender: () => {
          renderSheet(
            {
              dimensions: this.dimensions,
            },
          )(ctx);
        },

        postrender: () => {
          if (track?.path)
            renderTrack()(ctx, track);
        },
      },
    );
  }
}
