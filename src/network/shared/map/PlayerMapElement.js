import {vec2, vec3} from '@pkg/gl-math';

import {
  CAR_TYPES,
  OBJECT_TYPES,
} from '@game/network/constants/serverCodes';

import CarPhysicsBody from '../logic/physics/CarPhysicsBody';
import MapElement from './MapElement';

/**
 * Calculates angle and position car on map segment
 *
 * @param {Segments[]} segments
 * @param {Number} segmentIndex
 * @param {Object} transform
 *
 * @returns {Object}
 */
export const CAR_ALIGN = {
  CENTER: 0,
  LEFT_CORNER: 1,
  RIGHT_CORNER: -1,
};

export const genCarSegmentTransform = ({
  segment,
  align = CAR_ALIGN.LEFT_CORNER,
} = {}) => {
  const point = vec3.add(
    segment.point,
    vec2.toVec3(
      vec2.fromScalar(align * segment.width / 2, segment.angle),
      0.0,
    ),
  );

  return {
    angle: segment.angle,
    pos: point,
  };
};

export default class PlayerMapElement extends MapElement {
  constructor(
    {
      playerID,
      carType = CAR_TYPES.BLUE,
      body = {},
      transform = {
        scale: [1.25, 1.25, 1.25],
      },
    },
  ) {
    super(OBJECT_TYPES.PLAYER, null, playerID);

    this.carType = carType;
    this.transform = transform;
    this.body = new CarPhysicsBody(body);
  }

  toBSON() {
    const {id, type, carType, body, transform} = this;

    return {
      id,
      type,
      params: {
        carType,
        body: body.toBSON(),
        transform: {
          ...transform,
          rotate: [0, 0, body.angle],
          translate: body.pos,
        },
      },
    };
  }
}
