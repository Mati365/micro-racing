import * as R from 'ramda';
import * as T from '@pkg/neural-network';

import BASIC_NEURAL_AI from '@game/server-res/ai/basic-ai.json';
import BASIC_NEURAL_AI_2 from '@game/server-res/ai/basic-ai-2.json';

import {getRandomArrayItem} from '@pkg/basic-helpers';

import {MAX_CAR_SPEED} from '../../physics/CarPhysicsBody';
import CarIntersectRays from './CarIntersectRays';

const AI_DB = [
  BASIC_NEURAL_AI,
  BASIC_NEURAL_AI_2,
];

const NEURAL_CAR_INPUTS = {
  THROTTLE_INPUT: 0,
  STEER_INPUT: 1,
};

const NEURAL_CAR_OUTPUTS = {
  THROTTLE_OUTPUT: 0,
  TURN_OUTPUT: 1,
};

export const MAX_TANH_DISTANCE = 2.5;

const createTanH = T.createLayer(T.NEURAL_ACTIVATION_TYPES.TAN_H);

/**
 * Creates basic game neural network
 *
 * @param {Number} raysCount
 *
 * @returns {NeuralNetwork}
 */
export const createCarNeuralNetwork = (raysCount) => {
  const inputCount = raysCount + R.keys(NEURAL_CAR_INPUTS).length;
  const outputsCount = R.keys(NEURAL_CAR_OUTPUTS).length;

  return T.createNeuralNetwork(
    [
      T.createInputLayer(inputCount),
      createTanH(
        Math.floor(inputCount * 2 / 3) + outputsCount,
      ),
      createTanH(outputsCount),
    ],
  );
};

export default class CarNeuralAI {
  constructor(
    {
      raysCount = 6,
      neural = getRandomArrayItem(AI_DB),
      car,
    } = {},
  ) {
    this.car = car;
    this.raysCount = raysCount;
    this.intersections = new CarIntersectRays(
      car.body,
      {
        viewDistance: 10,
        raysCount,
      },
    );

    this.setNeural(neural);
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

  setNeural(neural) {
    this.neural = neural || createCarNeuralNetwork(this.raysCount);
    return this;
  }

  getNeuralInputs() {
    const {
      car: {body},
      intersections,
    } = this;

    return [
      body.speed / MAX_CAR_SPEED * 3, // nornalize speed
      (body.steerAngle / body.maxSteerAngle) * 3,
      ...R.map(
        (intersection) => {
          if (!intersection)
            return 0;

          return intersection.uB * MAX_TANH_DISTANCE;
        },
        intersections.pickRaysClosestIntersects(),
      ),
    ];
  }

  drive({physics}) {
    const {
      car: {body},
      intersections,
      neural,
    } = this;

    // neural control
    intersections.update(physics, true);
    const neuralOutput = T.exec(
      this.getNeuralInputs(),
      neural,
    );

    let speedUp = neuralOutput[NEURAL_CAR_OUTPUTS.THROTTLE_OUTPUT] * 10;

    // fix for sleeping and lazy bots
    if (Math.abs(body.speed) < 1)
      speedUp += 14;

    body.speedUp(speedUp, false);
    body.turnSteerWheels(
      neuralOutput[NEURAL_CAR_OUTPUTS.TURN_OUTPUT],
    );
  }
}
