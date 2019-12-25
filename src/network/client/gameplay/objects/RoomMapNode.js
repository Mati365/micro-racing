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
import PlayerInfo from '@game/server/Player/PlayerInfo';
import {RoadMapElement} from '@game/network/shared/map';

import PhysicsMeshNode from './PhysicsMeshNode';
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

export const createOffscreenRefs = ({players, objects}) => ({
  objects,
  players: R.reduce(
    (acc, player) => {
      if (player) {
        acc[player.id] = {
          player,
        };
      }

      return acc;
    },
    {},
    players,
  ),
});

/**
 * @see
 *  It works in two modes! Offscreen is used in game board!
 *  In offscreen mode FGL is not provided and scene is not created
 *
 * @export
 * @class RoomMapNode
 */
export default class RoomMapNode {
  constructor(
    {
      f,
      board,
      initialRoomState, // response from loadInitialRoomState
      currentPlayer,
    },
  ) {
    this.f = f;
    this.board = board;
    this.currentPlayer = currentPlayer;
    this.physics = new PhysicsScene;

    // variables that are set after load map
    this.currentPlayerCar = null;
    this.roadNodes = [];

    if (initialRoomState)
      this.loadInitialRoomState(initialRoomState);
  }

  async loadInitialRoomState({players, objects}) {
    players = R.map(
      PlayerInfo.fromBSON,
      players,
    );

    // assign new player info after loading scene
    const updatedCurrentPlayerInfo = findByID(this.currentPlayer.id, players);
    if (updatedCurrentPlayerInfo) {
      updatedCurrentPlayerInfo.current = true;
      Object.assign(
        this.currentPlayer,
        updatedCurrentPlayerInfo,
      );
    }

    const {f, currentPlayer} = this;
    if (f) {
      const {
        buffer,
        refs,
      } = await appendToSceneBuffer(f)(
        {
          players,
          objects,
        },
      )(f.createSceneBuffer());

      this.sceneBuffer = buffer;
      this.refs = refs;
      this.roadNodes = R.filter(
        R.is(RoadNode),
        buffer.list || [],
      );

      this.render = ::this.sceneBuffer.render;
    } else {
      this.roadElement = R.filter(
        ({type}) => type === OBJECT_TYPES.ROAD,
        objects,
      );

      this.refs = createOffscreenRefs(
        {
          players,
          objects,
        },
      );
    }

    this.currentPlayerCar = this.refs.players[currentPlayer.id];
  }

  get players() {
    return this.refs.players;
  }

  release() {
    const {buffer} = this;

    buffer?.release();
    this.refs = {
      players: {},
      objects: {},
    };
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

    delete refs.players[player.id];
    delete refs.objects[carNode.id];
  }

  async appendObjects(
    {
      players = [],
      objects,
    },
  ) {
    const {f} = this;
    let refs = null;

    if (!f) {
      refs = createOffscreenRefs(
        {
          players,
          objects,
        },
      );
    } else {
      refs = await appendToSceneBuffer(f)(
        {
          players,
          objects,
        },
      )(this.sceneBuffer);
    }

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
