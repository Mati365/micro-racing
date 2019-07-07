
import {vec2, vec3, mat4, Size, toRadians} from '@pkg/gl-math';

import {
  SceneNode,
  MeshNode,
  MeshWireframe,
} from '@pkg/isometric-renderer/FGL/engine/scene';

import CarPhysicsBody from './CarPhysicsBody';
import WheelTrack from './WheelTrack';

export const CAR_ANGLE_FIX = toRadians(90);

class CarNodeWireframe extends MeshWireframe {
  constructor(f, sceneNode) {
    super(f, sceneNode);

    const {
      size,
      body: {wheels},
    } = sceneNode;

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
            color: f.colors.BLUE,
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

    this.wheelTrack = new WheelTrack(
      {
        f,
      },
    );
  }

  update() {
    const {prevWheelTrackPos, wheelTrack, meshWheels} = this;
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
      if (prevWheelTrackPos && !steering && vec2.dist(prevWheelTrackPos, translate) > 0.2) {
        wheelTrack.track(wheelTransform);
        wheelTracked = true;
      }
    }

    // update translated track position
    if (wheelTracked || !this.prevWheelTrackPos)
      this.prevWheelTrackPos = vec3(...translate);

    // scene node update
    super.update();
  }

  render(delta, mpMatrix) {
    const {wheelTrack, meshWheels} = this;

    for (let i = meshWheels.length - 1; i >= 0; --i)
      meshWheels[i].render(delta, mpMatrix);

    super.render(delta, mpMatrix);
    wheelTrack.render(delta, mpMatrix);
  }
}

export default class CarNode extends MeshNode {
  constructor({f, ...meshConfig}) {
    super(meshConfig);

    this.body = new CarPhysicsBody(
      {
        angle: this.rotate.z,
        pos: this.translate,
        size: this.size.toVec(),
      },
    );

    this.wireframe = new CarNodeWireframe(f, this);
  }

  update(delta) {
    const {body, translate, rotate} = this;

    // update attributes
    body.update(delta);
    rotate.z = body.angle;
    [translate.x, translate.y] = body.pos;
    this.updateTransformCache();

    // updated linked meshes
    super.update(delta);
  }
}
