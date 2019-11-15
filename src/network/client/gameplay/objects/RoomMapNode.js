import * as R from 'ramda';

import {OBJECT_TYPES} from '@game/network/constants/serverCodes';
import PALETTE from '@pkg/isometric-renderer/FGL/core/constants/colors';

import {
  findByID,
  mapObjValuesToPromise,
} from '@pkg/basic-helpers';

import {RoadMapElement} from '@game/network/shared/map';

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
  let mapNodes = {};
  R.forEach(
    (item) => {
      const {type, params, id} = item; // some engine methods can modify item

      switch (type) {
        /**
         * **size**, **items**
         */
        case OBJECT_TYPES.TERRAIN: {
          const {size, items, ...renderParams} = params;

          mapNodes[id] = buffer.createNode(
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
          const segmentsInfo = RoadMapElement.fromBSON(item).getSegmentsInfo();

          mapNodes[id] = buffer.createNode(sceneParams => new RoadNode(
            {
              ...sceneParams,
              uniforms: {
                color: PALETTE.WHITE,
              },
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

          mapNodes[id] = buffer.createNode(
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
          const {carType, playerID, ...renderParams} = params;

          mapNodes[id] = buffer.createNode(async sceneParams => new CarNode(
            {
              ...sceneParams,
              ...renderParams,
              id,
              type: carType,
              player: findByID(playerID, players),
            },
          ));
        } break;

        default:
      }
    },
    objects,
  );

  mapNodes = await mapObjValuesToPromise(R.identity, mapNodes);
  return {
    buffer,
    refs: {
      objects: mapNodes,
      players: R.reduce(
        (acc, [, object]) => {
          if (object.player)
            acc[object.player.id] = object;

          return acc;
        },
        {},
        R.toPairs(mapNodes),
      ),
    },
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

  async loadInitialRoomState({players, objects, ...roomInfo}) {
    const {f, currentPlayer} = this;
    const {
      buffer,
      refs,
    } = await appendToSceneBuffer(f)(
      {
        players,
        objects,
      },
    )(f.createSceneBuffer());

    this.roomInfo = roomInfo;
    this.sceneBuffer = buffer;

    this.refs = refs;
    this.currentPlayerCar = refs.players[currentPlayer.id];

    this.update = ::this.sceneBuffer.update;
    this.render = ::this.sceneBuffer.render;
  }

  removePlayerCar(player) {
    const {sceneBuffer, refs} = this;
    const carNode = refs.players[player.id];

    sceneBuffer.removeNode(carNode);

    delete refs.players[player.id];
    delete refs.objects[carNode.id];
  }

  async appendObjects({players = [], objects}) {
    const {refs} = await appendToSceneBuffer(this.f)(
      {
        players,
        objects,
      },
    )(this.sceneBuffer);

    this.refs = {
      players: {
        ...this.refs.players,
        ...refs.players,
      },

      objects: {
        ...this.refs.objects,
        ...refs.objects,
      },
    };
  }
}
