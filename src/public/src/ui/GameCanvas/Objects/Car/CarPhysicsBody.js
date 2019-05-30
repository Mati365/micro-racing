import {
  clamp, lerp,
  toRadians, vec2,
} from '@pkg/gl-math';

/**
 * We want to push car to up if force is positive number
 * so add 270 degrees
 */
const CANVAS_ROTATION_SUFFIX = 3 * Math.PI / 2;

const makeWheel = (x, y, steering = false) => ({
  pos: vec2(x, y),
  steering,
});

/**
 * @see http://www.asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html
 * @see https://codea.io/talk/discussion/6648/port-of-marco-monsters-2d-car-physics-now-with-video
 * @see https://github.com/nadako/cars/blob/gh-pages/Car.hx
 *
 * @see https://github.com/spacejack/carphysics2d/blob/master/marco/Cardemo.c
 */
export default class CarPhysicsBody {
  constructor(
    {
      maxSpeed = 5,

      // rotations
      angle = toRadians(0),
      steerAngle = toRadians(30), // relative to root angle
      maxSteerAngle = toRadians(30),

      // left top corner
      pos = vec2(0, 0),
      size = vec2(0, 0),
      massCenter = vec2(0.5, 0.5),

      // distance between axle and mass center
      // normalized to size and mass center
      axles = {
        front: -0.3,
        rear: 0.3,
      },
    } = {},
  ) {
    this.angle = angle;
    this.steerAngle = steerAngle;
    this.actualSteerAngle = steerAngle;
    this.maxSteerAngle = maxSteerAngle;

    this.massCenter = vec2(0.5, 0.5 + lerp());
    this.size = size;
    this.pos = pos;

    this.speed = 0;
    this.maxSpeed = maxSpeed;

    // wheelBase is distance betwen axles
    this.axles = axles;
    this.wheelBase = axles.rear - axles.front;

    // todo: maybe adding support for more than 4 wheels will be good?
    this.wheels = [
      makeWheel(0, massCenter.y + axles.front, true), // top left
      makeWheel(1, massCenter.y + axles.front, true), // top right

      makeWheel(0, massCenter.y + axles.rear), // bottom left
      makeWheel(1, massCenter.y + axles.rear), // bottom right
    ];
  }

  turn(delta) {
    const {maxSteerAngle, steerAngle} = this;

    this.steerAngle = clamp(
      -maxSteerAngle,
      maxSteerAngle,
      steerAngle + delta,
    );
  }

  speedUp(delta) {
    const {maxSpeed, speed} = this;

    this.speed = clamp(0, maxSpeed, speed + delta);
  }


  update(delta) {
    const {speed} = this;
    if (!speed)
      return;

    const carDirection = vec2.fromScalar(speed, this.angle + CANVAS_ROTATION_SUFFIX);

    this.actualSteerAngle = lerp(this.actualSteerAngle, this.steerAngle, 0.2 / speed);

    const rotateRadius = this.wheelBase * this.size.y / Math.sin(this.actualSteerAngle);
    const angularVelocity = vec2.len(carDirection) / rotateRadius * (this.speed > 2 ? 0.85 : 1.0);

    this.angle += angularVelocity * delta;
    this.pos = vec2.add(this.pos, carDirection);
  }
}
