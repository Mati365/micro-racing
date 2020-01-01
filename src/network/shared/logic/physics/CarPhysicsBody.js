import * as R from 'ramda';

import {
  clamp, toRadians,
  vec2, Size,
} from '@pkg/gl-math';

import PhysicsBody from '@pkg/physics/types/PhysicsBody';

export const MAX_CAR_SPEED = 90;

export const PHYSICS_SPEED = 1.0 / 100;

export const GRAVITY = 9.81;

export const FRONT_TRAIN = 0;

const makeWheel = (x, y, steering = false) => ({
  pos: vec2(x, y),
  steering,
});

const vec2rot = (angle, vec) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return vec2(
    vec.x * sin + vec.y * cos,
    vec.x * cos - vec.y * sin,
  );
};

/**
 * @see http://www.asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html
 * @see https://codea.io/talk/discussion/6648/port-of-marco-monsters-2d-car-physics-now-with-video
 * @see https://github.com/nadako/cars/blob/gh-pages/Car.hx
 *
 * @see https://github.com/spacejack/carphysics2d/blob/master/marco/Cardemo.c
 *
 * @description
 * - Sideslip angle (BETA) is angle between velocity and car angle
 */
export default class CarPhysicsBody extends PhysicsBody {
  constructor(
    {
      mass = 100,

      // rotations
      angle = toRadians(45),
      steerAngle = toRadians(0), // relative to root angle
      maxSteerAngle = toRadians(45),
      maxGrip = 120,
      corneringStiffness = {
        front: -80.0,
        rear: -80.2,
      },

      // left top corner
      velocity = vec2(0, 0),
      pos = vec2(0, 0),
      size = vec2(0, 0),
      massCenter = vec2(0.5, 0.5),

      // size of wheel relative to size
      wheelSize = vec2(0.2, 0.25),

      // distance between axle and mass center
      // normalized to size and mass center
      axles = {
        front: -0.5,
        rear: 0.5,
      },
    } = {},
  ) {
    super(
      {
        moveable: true,
        size,
        pos,
      },
    );

    this.braking = false;
    this.mass = mass;
    this.inertia = mass;
    this.angularVelocity = 0;
    this.velocity = velocity;
    this.speed = vec2.len(velocity);
    this.acceleration = 0;

    this.angle = angle;
    this.lastSteerAngleDelta = 0;
    this.steerAngle = steerAngle;
    this.maxSteerAngle = maxSteerAngle;

    this.massCenter = massCenter;
    this.throttle = 0;
    this.maxThrottle = 300;
    this.brake = 0;

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

    // precomputed
    this.weight = mass * GRAVITY;
    this.axleWeights = {
      front: -axles.front / this.wheelBase * this.weight,
      rear: axles.rear / this.wheelBase * this.weight,
    };

    this.corneringStiffness = corneringStiffness;

    this.maxGrip = maxGrip;
    this.resistance = 5.0;
    this.drag = 3.5;
  }

  freeze() {
    this.velocity = vec2(0, 0);
    this.angularVelocity = 0;
    this.throttle = 0;
    return this;
  }

  get velocityVector() {
    return vec2.mul(
      PHYSICS_SPEED / 1.5,
      vec2(this.velocity.x, -this.velocity.y),
    );
  }

  set velocityVector(v) {
    this.velocity = vec2.mul(
      1 / (PHYSICS_SPEED / 1.5),
      vec2(v.x, -v.y),
    );
  }

  turnSteerWheels(delta) {
    this.lastSteerAngleDelta = delta;
    this.steerAngle = clamp(
      -this.maxSteerAngle,
      this.maxSteerAngle,
      this.steerAngle + delta,
    );
  }

  speedUp(delta, allowReverse = true, maxThrottleRatio = 1.0) {
    const {maxThrottle} = this;

    this.throttle = clamp(
      allowReverse
        ? -maxThrottle * maxThrottleRatio
        : 0,
      maxThrottle * maxThrottleRatio,
      this.throttle + delta,
    );
  }

  update() {
    const {
      angle,
      angularVelocity, velocity,
      axles, maxGrip,
      corneringStiffness, axleWeights,
      throttle, brake, drag, resistance,
      mass, inertia, steerAngle,
    } = this;

    const worldVelocity = vec2rot(angle, velocity);
    const slipAngles = {
      front: 0.0,
      rear: 0.0,
    };

    if (worldVelocity.x !== 0) {
      const absVLong = Math.abs(worldVelocity.x);
      slipAngles.front = (
        Math.atan2(worldVelocity.y + angularVelocity * -axles.front, absVLong)
          - (steerAngle * Math.sign(worldVelocity.x))
      );

      slipAngles.rear = Math.atan2(worldVelocity.y - angularVelocity * axles.rear, absVLong);
    }

    const frontCoef = 0.5 * FRONT_TRAIN;
    const rearCoef = 1.0 - frontCoef;

    const fLateral = {
      front: vec2(
        0,
        Math.max(
          -maxGrip,
          Math.min(maxGrip, corneringStiffness.front * slipAngles.front),
        ) * axleWeights.front,
      ),
      rear: vec2(
        0,
        Math.max(
          -maxGrip,
          Math.min(maxGrip, corneringStiffness.rear * slipAngles.rear),
        ) * axleWeights.rear,
      ),
    };

    const fTraction = vec2(
      100 * (throttle * (rearCoef + frontCoef * Math.cos(steerAngle)) - brake * Math.sign(worldVelocity.x)), // eslint-disable-line max-len
      100 * (throttle * frontCoef * Math.sin(steerAngle)),
    );

    const fResistance = vec2(
      -(resistance * worldVelocity.x + drag * worldVelocity.x * Math.abs(worldVelocity.x)),
      -(resistance * worldVelocity.y + drag * worldVelocity.y * Math.abs(worldVelocity.y)),
    );

    const fCornering = vec2.add(
      fLateral.rear,
      vec2.mul(
        Math.cos(steerAngle),
        fLateral.front,
      ),
    );

    const fTotal = vec2.add(
      fTraction,
      vec2.add(fCornering, fResistance),
    );

    const localAcceleration = vec2.div(mass, fTotal);
    const acceleration = vec2rot(angle, localAcceleration);

    this.velocity = vec2.add(
      vec2.mul(PHYSICS_SPEED, acceleration),
      this.velocity,
    );
    this.speed = vec2.len(velocity);

    if (Math.abs(this.throttle) < 5 && this.speed < 5.0) {
      this.speed = 0;

      this.velocity.x = 0;
      this.velocity.y = 0;

      fTotal.x = 0;
      fTotal.y = 0;

      fLateral.rear.y = 0;
      fLateral.front.y = 0;

      this.corneringIntensity = 0;
      this.angularVelocity = 0;
    }

    if (this.speed || this.throttle) {
      this.pos = vec2.add(
        this.velocityVector,
        this.pos,
      );

      const torque = -fLateral.rear.y * axles.rear + fLateral.front.y * -axles.front;
      const angularAcceleration = torque / inertia;

      // smooth wheel returning to 0 position interpolation
      this.angularVelocity += PHYSICS_SPEED * angularAcceleration;

      const angleDelta = PHYSICS_SPEED * this.angularVelocity;
      this.angle += angleDelta;
      this.steerAngle *= 0.9;

      if (Math.abs(this.throttle) < 1)
        this.throttle = 0.0;
      else
        this.throttle *= 0.95;

      this.corneringIntensity = vec2.len(fCornering) / 8000;
    }

    this.updateVerticesShapeCache();
  }

  toJSON = (() => {
    const serializer = R.pick(
      [
        'mass', 'velocity', 'angle', 'steerAngle', 'maxSteerAngle', 'throttle',
        'pos', 'size', 'massCenter', 'wheelSize', 'axles', 'angularVelocity',
        'maxGrip',
      ],
    );

    return () => serializer(this);
  })();

  toBSON = ::this.toJSON;

  static fromJSON = (() => {
    const deserializer = R.compose(
      R.evolve(
        {
          size: size => new Size(size.w, size.h, size.z),
        },
      ),
      R.converge(
        R.merge,
        [
          R.pick([
            'mass', 'size', 'angle', 'steerAngle', 'maxSteerAngle',
            'axles', 'angularVelocity', 'maxGrip',
          ]),
          R.compose(
            R.mapObjIndexed(obj => obj && vec2(...obj)),
            R.pick(['velocity', 'pos', 'massCenter', 'wheelSize']),
          ),
        ],
      ),
    );

    return (json, additionalParams) => new CarPhysicsBody(
      {
        ...deserializer(json),
        ...additionalParams,
      },
    );
  })();
}
