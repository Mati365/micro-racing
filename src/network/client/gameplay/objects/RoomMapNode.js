import * as R from 'ramda';

import {findByID} from '@pkg/basic-helpers';

import {OBJECT_TYPES} from '../../../constants/serverCodes';

import * as Factory from '../factory';
import CarNode from './Car';
import RoadNode from './RoadNode/RoadNode';

/**
 * @see MapElement
 */
export const appendToSceneBuffer = f => ({
  players = [],
  objects,
}) => async (buffer) => {
  const playersCars = {};

  const asyncObjectsQueue = [];

  R.forEach(
    (item) => {
      const {type, params, id} = item; // some engine methods can modify item

      switch (type) {
        /**
         * **size**, **items**
         */
        case OBJECT_TYPES.TERRAIN: {
          const {size, items, ...renderParams} = params;

          buffer.createNode(
            async () => ({
              ...renderParams,
              id,
              renderer: await Factory.createTerrain(f)(
                {
                  size,
                  items,
                },
              ),
            }),
          );
        } break;

        /**
         * **segments**
         */
        case OBJECT_TYPES.ROAD: {
          const {segmentsInfo, ...renderParams} = params;

          buffer.createNode(sceneParams => new RoadNode(
            {
              ...sceneParams,
              ...renderParams,
              id,
              segmentsInfo,
            },
          ));
        } break;

        /**
         * Each primitive should contain **name** field and
         * optionally **constructor**
         */
        case OBJECT_TYPES.PRIMITIVE: {
          const {name, constructor, ...renderParams} = params;

          buffer.createNode(
            {
              renderer: f.mesh[name](constructor),
              id,
              ...renderParams,
            },
          );
        } break;

        /**
         * Each player should contain **id**, **type**
         */
        case OBJECT_TYPES.PLAYER: {
          const {carType, ...renderParams} = params;
          const carCreator = async sceneParams => (playersCars[id] = new CarNode(
            {
              ...sceneParams,
              ...renderParams,
              id,
              nick: findByID(id, players).nick,
              renderer: await Factory.createTexturedCar(f)(carType),
            },
          ));

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
    initialRoomState,
    currentPlayer,
  }) {
    this.f = f;
    this.currentPlayer = currentPlayer;

    if (initialRoomState)
      this.loadInitialRoomState(initialRoomState);
  }

  async loadInitialRoomState({players, objects}) {
    const {f, currentPlayer} = this;
    const {
      buffer,
      playersCars,
    } = await appendToSceneBuffer(f)(
      {
        players,
        objects,
      },
    )(f.createSceneBuffer());

    this.sceneBuffer = buffer;

    this.playersCars = playersCars;
    this.currentPlayerCar = playersCars[currentPlayer.id];

    this.update = ::this.sceneBuffer.update;
    this.render = ::this.sceneBuffer.render;
  }

  removePlayerCar(player) {
    const {sceneBuffer, playersCars} = this;
    const carNode = playersCars[player.id];

    sceneBuffer.removeNode(carNode);
    delete playersCars[player.id];
  }

  async appendObjects({players = [], objects}) {
    const {playersCars} = await appendToSceneBuffer(this.f)(
      {
        players,
        objects,
      },
    )(this.sceneBuffer);

    Object.assign(this.playersCars, playersCars);
  }
}
