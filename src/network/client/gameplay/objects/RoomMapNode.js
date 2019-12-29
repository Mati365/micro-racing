import * as R from 'ramda';

import PALETTE from '@pkg/isometric-renderer/FGL/core/constants/colors';

import {OBJECT_TYPES} from '@game/network/constants/serverCodes';
import {MESHES} from '@game/shared/sceneResources/meshes';

import {
  dig,
  findByID,
  mapObjValuesToPromise,
} from '@pkg/basic-helpers';

import createTerrain from '@game/shared/sceneResources/terrain';
import {fetchMeshURLResource} from '@game/shared/sceneResources/utils';

import PhysicsScene from '@pkg/physics-scene';
import {RoadMapElement} from '@game/network/shared/map';

import PhysicsMeshNode from './PhysicsMeshNode';
import CarNode from './Car';
import RoadNode from './RoadNode/RoadNode';
import RoomMapRefsStore from './RoomMapRefsStore';

/**
 * @see MapElement
 */
export const appendToSceneBuffer = f => ({
  players = [],
  objects,
}) => async (buffer) => {
  const findRefsPlayer = (
    R.is(Array, players)
      ? (playerID) => {
        const obj = findByID(playerID, players);
        if (obj?.player)
          return obj.player;

        return obj;
      }
      : (playerID) => {
        const obj = players[playerID];
        if (obj?.player)
          return obj.player;

        return obj;
      }
  );

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
              renderer: await createTerrain(f)(
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

        case OBJECT_TYPES.MESH: {
          const {meshResPath, ...renderParams} = params;

          mapNodes[id] = buffer.createNode(
            sceneParams => new PhysicsMeshNode(
              {
                ...sceneParams,
                ...renderParams,
                id,
                renderer: f.loaders.mesh.from.cached(
                  {
                    key: `mesh-${meshResPath}`,
                    resolver: () => fetchMeshURLResource(
                      dig(meshResPath, MESHES),
                    ),
                  },
                ),
              },
            ),
          );
        } break;

        /**
         * Each player should contain **id**, **type**
         */
        case OBJECT_TYPES.PLAYER: {
          const {carType, playerID, ...renderParams} = params;

          mapNodes[id] = buffer.createNode(sceneParams => new CarNode(
            {
              ...sceneParams,
              ...renderParams,
              id,
              type: carType,
              player: findRefsPlayer(playerID),
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
    refsStore: new RoomMapRefsStore(
      {
        objects: mapNodes,
        players: R.reduce(
          (acc, [, object]) => {
            const {player} = object;
            if (player)
              acc[player.id] = object;

            return acc;
          },
          {},
          R.toPairs(mapNodes),
        ),
      },
    ),
  };
};

/**
 * @see
 *  Stores information about SCENE nodes. Used on client!
 *
 * @export
 * @class RoomMapNode
 */
export default class RoomMapNode extends RoomMapRefsStore {
  constructor(
    {
      f,
      board,
      currentPlayer,
    },
  ) {
    super();

    this.f = f;
    this.board = board;
    this.currentPlayer = currentPlayer;
    this.physics = new PhysicsScene;

    // variables that are set after load map
    this.roadNodes = [];
  }

  async bootstrapRefs({players, objects}) {
    this.release();

    const {f} = this;
    const {
      buffer,
      refsStore,
    } = await appendToSceneBuffer(f)(
      {
        players,
        objects: R.values(objects),
      },
    )(f.createSceneBuffer());

    this.sceneBuffer = buffer;
    this.refs = refsStore.refs;
    this.roadNodes = R.filter(
      R.is(RoadNode),
      buffer.list || [],
    );

    this.render = ::this.sceneBuffer.render;

    return {
      refsStore,
      buffer,
    };
  }

  release() {
    this.buffer?.release();
    super.release();
  }

  update(interpolate) {
    const {physics, board} = this;
    const {list} = this.sceneBuffer;

    // fixme: Maybe integrate sceneBuffer with phyics in different way?
    physics.items = list;

    for (let i = 0, len = list.length; i < len; ++i) {
      const item = list[i];

      item.update && item.update(interpolate);
      if (item.body && interpolate.fixedStepUpdate)
        physics.updateObjectPhysics(item.body, board.roomInfo.config.aiTraining);
    }
  }

  removePlayerCar(player) {
    const {sceneBuffer, refs} = this;
    const carNode = refs.players[player.id];

    sceneBuffer?.removeNode(carNode);
    super.removePlayerCar(player);
  }

  async appendObjects(
    {
      players = [],
      objects,
    },
  ) {
    this.appendRefsStore(
      await appendToSceneBuffer(this.f)(
        {
          players,
          objects,
        },
      )(this.sceneBuffer),
    );
  }
}
