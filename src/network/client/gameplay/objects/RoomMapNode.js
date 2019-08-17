import * as R from 'ramda';

import {findByID} from '@pkg/basic-helpers';

import {OBJECT_TYPES} from '../../../constants/serverCodes';

import * as Factory from '../factory';
import CarNode from './Car';

/**
 * @see MapElement
 */
export const createMapSceneBuffer = f => async ({players, map: {objects}}) => {
  const buffer = f.createSceneBuffer();
  const playersCars = {};

  const asyncObjectsQueue = [];

  R.forEach(
    (item) => {
      const {type, params} = R.clone(item); // some engine methods can modify item

      switch (type) {
        /**
         * Each primitive should contain **name** field and
         * optionally **constructor**
         */
        case OBJECT_TYPES.PRIMITIVE: {
          const {name, constructor, ...renderParams} = params;

          buffer.createNode(
            {
              renderer: f.mesh[name](constructor),
              ...renderParams,
            },
          );
        } break;

        /**
         * Each player should contain **playerID**, **type**
         */
        case OBJECT_TYPES.PLAYER: {
          const {carType, playerID, ...renderParams} = params;
          const carCreator = async (sceneParams) => {
            const car = new CarNode(
              {
                ...sceneParams,
                ...renderParams,
                nick: findByID(playerID, players).nick,
                renderer: await Factory.createTexturedCar(f)(carType),
              },
            );

            playersCars[playerID] = car;
            return car;
          };

          asyncObjectsQueue.push(
            buffer.createNode(carCreator),
          );
        } break;

        default:
      }
    },
    objects,
  );

  await Promise.all(asyncObjectsQueue);

  return {
    buffer,
    playersCars,
  };
};

export default class RoomMapNode {
  constructor({
    f,
    room,
    currentPlayer,
  }) {
    this.f = f;
    this.currentPlayer = currentPlayer;

    if (room)
      this.setRoom(room);
  }

  async setRoom(room) {
    const {f, currentPlayer} = this;
    const {
      buffer,
      playersCars,
    } = await createMapSceneBuffer(f)(room);

    this.room = room;
    this.sceneBuffer = buffer;

    this.playersCars = playersCars;
    this.currentPlayerCar = playersCars[currentPlayer.id];

    this.update = ::this.sceneBuffer.update;
    this.render = ::this.sceneBuffer.render;
  }
}
