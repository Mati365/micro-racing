import {toRadians, vec2, clamp} from '@pkg/gl-math';

const GRAVITY = 9.81;

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
 *
 * @description
 * - Sideslip angle (BETA) is angle between velocity and car angle
 *
 */
export default class CarPhysicsBody {
  constructor(
    {
      mass = 1500,

      velocity = vec2(0, 0),

      // rotations
      angle = toRadians(30),
      steerAngle = toRadians(-30), // relative to root angle

      // left top corner
      pos = vec2(0, 0),
      size = vec2(0, 0),

      // size of wheel relative to size
      wheelSize = vec2(0.2, 0.25),

      // relative to pos
      massCenter = vec2(0.5, 0.5),

      // distance between axle and mass center
      // normalized to size and mass center
      axles = {
        front: -0.2,
        rear: 0.3,
      },
    } = {},
  ) {
    this.braking = false;
    this.mass = mass;
    this.angularVelocity = 0;
    this.velocity = velocity;
    this.acceleration = 0;

    this.angle = angle;
    this.steerAngle = steerAngle;

    this.massCenter = massCenter;
    this.size = size;
    this.pos = pos;

    // wheelBase is distance betwen axles
    this.axles = axles;
    this.wheelSize = wheelSize;
    this.wheelBase = axles.rear - axles.front;

    // // gearbox
    // this.gearsRatio = {
    //   1: 2.66,
    //   2: 1.78,
    //   3: 1.30,
    //   4: 1.0,
    //   5: 0.74,
    //   6: 0.50,
    //   R: 2.90,
    // };

    // todo: maybe adding support for more than 4 wheels will be good?
    this.wheels = [
      makeWheel(0, massCenter.y + axles.front, true), // top left
      makeWheel(1, massCenter.y + axles.front, true), // top right

      makeWheel(0, massCenter.y + axles.rear), // bottom left
      makeWheel(1, massCenter.y + axles.rear), // bottom right
    ];
  }

  update(delta) {
    const {
      angle, mass, velocity,
      braking, wheelBase, axles,
    } = this;

    const weight = GRAVITY * mass;
    const unitCarDirection = vec2.normalize(
      vec2.fromScalar(
        // car is rotated, fromScalar function is accepting angle
        // from -------- instead of ---|
        1,
        angle + CANVAS_ROTATION_SUFFIX,
      ),
    );

    const fTraction = vec2.mul(
      20,
      unitCarDirection,
    );

    // BRAKING
    const brakingConst = 50;
    const fBraking = (
      braking
        ? vec2.mul(-brakingConst, unitCarDirection)
        : vec2(0, 0)
    );

    /**
     * AIR
     *
     * non arcade style:
     * F(drag) = 0.5 * Cd * frontalArea * rho * (v ^ 2)
     *
     * rho = 1.29 // air density
     * frontalArea = 2.2 // 2.2 m^2
     * Cd = 0.3
     *
     * Cdrag = 0.5 * 0.3 * 2.2 * 1.29
     * Crr = 30 * Cdrag
     */
    const aerodynamicDragConst = 5;
    const fAeroDrag = vec2.mul(
      -aerodynamicDragConst * vec2.len(velocity),
      velocity,
    );

    // Rolling
    const rollingDragConst = 30;
    const fRollingDrag = vec2.mul(
      -rollingDragConst,
      velocity,
    );

    // Weight transfer and axles weights
    // calculate axles weights
    const frontAxleWeight = (-axles.front / wheelBase) * weight;
    const rearAxleWeight = (axles.rear / wheelBase) * weight;

    // TOTAL
    const F = vec2.compose.add(
      fTraction,
      fBraking,
      fAeroDrag,
      fRollingDrag,
    );

    // update velocity and pos
    this.acceleration = vec2.div(mass, F);
    this.velocity = vec2.add(
      this.velocity,
      vec2.mul(delta, this.acceleration),
    );

    this.pos = vec2.add(
      this.pos,
      vec2.mul(delta, this.velocity),
    );
  }
}
