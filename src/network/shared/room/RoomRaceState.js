import {RACE_STATES} from '@game/network/constants/serverCodes';
import {requiredParam} from '@pkg/basic-helpers';

export default class RaceState {
  static States = RACE_STATES;

  constructor(
    type = requiredParam('Type is required in RaceState!'),
    payload,
  ) {
    this.type = type;
    this.payload = payload;
  }

  static fromBSON({type, payload}) {
    return new RaceState(type, payload);
  }

  toBSON() {
    return {
      type: this.type,
      payload: this.payload,
    };
  }
}
