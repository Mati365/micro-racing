import {toRadians, vec2} from '@pkg/gl-math';

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

    this.angle = angle;
    this.steerAngle = steerAngle;

    this.massCenter = massCenter;
    this.size = size;
    this.pos = pos;

    // wheelBase is distance betwen axles
    this.axles = axles;
    this.wheelSize = wheelSize;
    this.wheelBase = axles.rear - axles.front;

    // todo: maybe adding support for more than 4 wheels will be good?
    this.wheels = [
      makeWheel(0, massCenter.y + axles.front, true), // top left
      makeWheel(1, massCenter.y + axles.front, true), // top right

      makeWheel(0, massCenter.y + axles.rear), // bottom left
      makeWheel(1, massCenter.y + axles.rear), // bottom right
    ];
  }

  update(delta) {
    // const {mass, wheelBase, axles} = this;

    const {angle, mass, velocity, braking} = this;

    // const weightFrontAxle = (Math.abs(axles.front) / wheelBase) * weight;
    // const weightRearAxle = (axles.rear / wheelBase) * weight;

    /**
     * Forces:
     * // silnik
     * // u is a unit vector in the direction of the car's heading.
     * F(traction) = u * engineForce
     *
     * // opory powietrza
     * const aerodynamicDrag = 0.5;
     *
     * F(drag) = -aerodynamicDrag * v * len(v)
     * speed = vec2.len(velocity)
     * fdrag.x = -aerodynamicDrag * velocity.x * speed;
     * fdrag.y = -aerodynamicDrag * velocity.y * speed;
     *
     * // opory toczenia
     * const surfaceResistance = 0.5;
     * F(resistance) = -surfaceResistance * velocity
     *
     * // sumaryczna siła
     * F(long) = F(traction) + F(drag) + F(resistance)
     *
     * // aktualizowanie parametrów
     * a = F / weight
     * velocity += dt * a
     * position += dt * velocity
     */
    const brakingConst = 0.5;
    const engineForceConst = 100;

    const unitCarDirection = vec2.normalize(
      vec2.fromScalar(
        // car is rotated, fromScalar function is accepting angle
        // from -------- instead of ---|
        1,
        angle + CANVAS_ROTATION_SUFFIX,
      ),
    );

    // ENGINE
    const fTraction = (
      braking
        ? vec2.mul(-brakingConst, unitCarDirection)
        : vec2.mul(engineForceConst, unitCarDirection)
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
    const aerodynamicDragConst = 0.35;
    const fAeroDrag = vec2.mul(
      -aerodynamicDragConst * vec2.len(velocity),
      velocity,
    );

    // ROLLING
    const rollingDragConst = 0.5;
    const fRollingDrag = vec2.mul(
      -rollingDragConst,
      velocity,
    );

    // Total
    const F = vec2.add(
      fTraction,
      vec2.add(fAeroDrag, fRollingDrag),
    );

    const weight = GRAVITY * mass;
    const acceleration = vec2.div(weight, F);

    this.velocity = vec2.add(
      this.velocity,
      vec2.mul(delta, acceleration),
    );

    this.pos = vec2.add(
      this.pos,
      vec2.mul(delta, this.velocity),
    );
  }
}
