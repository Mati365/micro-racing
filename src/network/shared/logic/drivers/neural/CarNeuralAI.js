import * as R from 'ramda';
import * as T from '@pkg/neural-network';

import {getRandomArrayItem} from '@pkg/basic-helpers';

import {MAX_CAR_SPEED} from '../../physics/CarPhysicsBody';
import {DEFAULT_RAYS_SETTINGS} from './CarCollidableRay';

import CarIntersectRays from './CarIntersectRays';

export const NEURAL_CAR_INPUTS = {
  THROTTLE_INPUT: 0,
  STEER_INPUT: 1,
};

export const NEURAL_CAR_OUTPUTS = {
  THROTTLE_OUTPUT: 0,
  TURN_OUTPUT: 1,
};

export const MAX_TANH_DISTANCE = 2.0;

export const NEURAL_OUTPUT_SCALE = {
  THROTTLE: 15,
  TURN: 1 / 5,
};

export {
  DEFAULT_RAYS_SETTINGS,
};

const createTanH = T.createLayer(T.NEURAL_ACTIVATION_TYPES.TAN_H);

/**
 * Creates basic game neural network
 *
 * @param {Number} raysCount
 *
 * @returns {NeuralNetwork}
 */
export const createCarNeuralNetwork = (raysCount = DEFAULT_RAYS_SETTINGS.raysCount) => {
  const inputCount = raysCount + R.keys(NEURAL_CAR_INPUTS).length;
  const outputsCount = R.keys(NEURAL_CAR_OUTPUTS).length;

  return T.createNeuralNetwork(
    [
      T.createInputLayer(inputCount),
      createTanH(inputCount),
      createTanH(4),
      createTanH(outputsCount),
    ],
  );
};

export default class CarNeuralAI {
  constructor(
    {
      raysCount = DEFAULT_RAYS_SETTINGS.raysCount,
      viewDistance = DEFAULT_RAYS_SETTINGS.viewDistance,
      neural,
      player,
    } = {},
  ) {
    this.player = player;
    this.raysCount = raysCount;
    this.viewDistance = viewDistance;
    this.intersections = null;

    this.setNeural(
      neural || getRandomArrayItem(player.server.neurals),
    );
  }

  get car() {
    return this.player.info.car;
  }

  updateScore() {
    const {
      racingState: {
        laps,
        currentCheckpoint,
      },
    } = this.car.player.info;

    this.score = (laps || 0) * 100 + (currentCheckpoint || 0) * 10;
    return this;
  }

  resetNeural() {
    this.setNeural(null);
  }

  setNeural(neural) {
    this.neural = neural || createCarNeuralNetwork(this.raysCount);
    return this;
  }

  static getNeuralInputs(body, intersections) {
    return [
      body.speed / MAX_CAR_SPEED * MAX_TANH_DISTANCE, // nornalize speed
      (body.steerAngle / body.maxSteerAngle) * MAX_TANH_DISTANCE,
      ...R.map(
        (intersection) => {
          if (intersection === null)
            return MAX_TANH_DISTANCE;

          return intersection.uB * MAX_TANH_DISTANCE;
        },
        intersections.pickRaysClosestIntersects(),
      ),
    ];
  }

  drive({physics}) {
    const {
      car: {
        body,
      },
      raysCount,
      viewDistance,
      neural,
    } = this;

    if (!this.intersections) {
      this.intersections = new CarIntersectRays(
        this.car.body,
        {
          viewDistance,
          raysCount,
        },
      );
    }

    // neural control
    this.intersections.update(physics, true);
    const neuralOutput = T.exec(
      CarNeuralAI.getNeuralInputs(body, this.intersections),
      neural,
    );

    let speedUp = Math.max(
      3,
      neuralOutput[NEURAL_CAR_OUTPUTS.THROTTLE_OUTPUT] * NEURAL_OUTPUT_SCALE.THROTTLE,
    );

    // fix for sleeping and lazy bots
    if (Math.abs(body.speed) < 1.0)
      speedUp += 14;

    body.speedUp(speedUp, false, 1.0);
    body.turnSteerWheels(
      neuralOutput[NEURAL_CAR_OUTPUTS.TURN_OUTPUT] * NEURAL_OUTPUT_SCALE.TURN,
    );
  }
}
