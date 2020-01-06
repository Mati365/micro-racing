import * as R from 'ramda';

import {
  vec2, vec3, vec4,
  mat4, Size,
} from '@pkg/gl-math';

import {
  SceneNode,
  MeshWireframe,
} from '@pkg/isometric-renderer/FGL/engine/scene';

import CarIntersectRays from '@game/logic/drivers/neural/CarIntersectRays';
import WheelTrack from './WheelTrack';
import CarRaysWireframe from './CarRaysWireframe';

export default class CarNodeEffects extends MeshWireframe {
  constructor(f, sceneNode, config = {}) {
    const {
      wireframeColor = f.colors.BLUE,
      renderRaysWireframe = (process.env.NODE_ENV === 'development'),
    } = config;

    const {
      size,
      body: {
        wheels,
      },
    } = sceneNode;

    super(f, sceneNode, wireframeColor);
    this.config = config;
    this.wheelMeshSize = new Size(
      size.w * 0.2,
      size.h * 0.25,
      size.z * 0.5,
    );

    const wheelScalingMatrix = mat4.from.scaling(this.wheelMeshSize.toVec());
    const outerWidth = size.w + this.wheelMeshSize.w / 2;

    this.meshWheels = wheels.map(
      wheel => new SceneNode(
        {
          renderer: f.mesh.box(),
          uniforms: {
            color: wireframeColor,
          },
          attributes: {
            wheel,
            scalingMatrix: wheelScalingMatrix,
            inCarPositionMatrix: mat4.from.translation([
              wheel.pos[0] * outerWidth - outerWidth / 2,
              wheel.pos[1] * size.h - size.h / 2,
              0,
            ]),
          },
        },
      ),
    );

    this.wheelTracks = [
      null,
      null,
      new WheelTrack(
        {
          f,
        },
      ),
      new WheelTrack(
        {
          f,
        },
      ),
    ];

    // neural network debug
    this.rays = renderRaysWireframe && new CarRaysWireframe(
      f,
      {
        color: vec4(wireframeColor[0], wireframeColor[1], wireframeColor[2], 0.8),
        intersectRays: new CarIntersectRays(
          sceneNode.body,
          {
            renderInterpolation: true,
          },
        ),
      },
    );
  }

  release() {
    const {meshWheels, wheelTracks, rays} = this;

    super.release();
    rays && rays.release();

    R.forEach(
      meshWheel => meshWheel.release(),
      meshWheels,
    );

    R.forEach(
      wheelTrack => wheelTrack?.release(),
      wheelTracks,
    );
  }

  update(interpolate) {
    const {rays, prevWheelTrackPos, wheelTracks, meshWheels} = this;
    const {rotate, translate, body} = this.sceneNode;

    const carTransformMatrix = mat4.mutable.translate(
      translate,
      mat4.from.rotation(rotate),
    );

    let wheelTracked = false;

    for (let i = meshWheels.length - 1; i >= 0; --i) {
      const wheelMesh = meshWheels[i];
      const {steering} = wheelMesh.wheel;

      const wheelRotate = (
        steering
          ? [0, 0, body.steerAngle]
          : [0, 0, 0]
      );

      // flow:
      // -> scale
      // -> rotate around steering
      // -> move to inner car position
      // -> rotate / translate to car coordinates
      const wheelTransform = mat4.compose.mul(
        mat4.mutable.rotate(wheelRotate, mat4.from.identity()),
        wheelMesh.inCarPositionMatrix,
        carTransformMatrix,
      );
      mat4.mul(wheelTransform, wheelMesh.scalingMatrix, wheelTransform);
      wheelMesh.applyTransformMatrix(wheelTransform, true);

      // add segment to wheel
      const track = wheelTracks[i];
      if (track
          && interpolate.fixedStepUpdate
          && body.corneringIntensity >= 0.7
          && prevWheelTrackPos
          && vec2.dist(prevWheelTrackPos, translate) > 0.05) {
        track.track(wheelTransform);
        wheelTracked = true;
      }
    }

    // update translated track position
    if (wheelTracked || !this.prevWheelTrackPos)
      this.prevWheelTrackPos = vec3(...translate);

    // neural network
    if (rays)
      rays.update(interpolate);

    // scene node update
    super.update(interpolate);
  }

  renderTracks(interpolate, mpMatrix) {
    const {wheelTracks} = this;

    for (let i = wheelTracks.length - 1; i >= 0; --i) {
      const wheelTrack = wheelTracks[i];
      if (wheelTrack)
        wheelTrack.render(interpolate, mpMatrix);
    }
  }

  render(interpolate, mpMatrix) {
    const {meshWheels, config, rays} = this;

    this.renderTracks(interpolate, mpMatrix);

    if (config.renderBorders) {
      for (let i = meshWheels.length - 1; i >= 0; --i)
        meshWheels[i].render(interpolate, mpMatrix);

      super.render(interpolate, mpMatrix);
    }

    if (rays)
      rays.render(interpolate, mpMatrix);
  }
}
