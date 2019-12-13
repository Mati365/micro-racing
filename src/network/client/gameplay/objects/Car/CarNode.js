import * as R from 'ramda';

import {PLAYERS_CARS_ICONS} from '@game/shared/sceneResources/icons';

import {hexToVec4} from '@pkg/isometric-renderer/FGL/core/utils';
import {fetchCarMeshURLResource} from '@game/shared/sceneResources/cars';

import {HTMLTextNode} from '@pkg/isometric-renderer/FGL/engine/scene';
import CarPhysicsBody from '@game/shared/logic/physics/CarPhysicsBody';

import CarNodeEffects from './CarNodeEffects';
import PhysicsMeshNode from '../PhysicsMeshNode';

const createTexturedCarRenderer = f => R.memoizeWith(
  R.identity,
  type => (
    f.loaders.mesh.from.cached(
      {
        key: `car-${type}`,
        resolver: () => fetchCarMeshURLResource(
          {
            type,
          },
        ),
      },
    )
  ),
);

class PlayerNickTextNode extends HTMLTextNode {
  constructor(
    {
      f,
      player,
      arrowSize = 6,
    },
  ) {
    const {current} = player;
    const backgroundColor = `${player.racingState.color}${current ? '88' : '66'}`;

    super(
      {
        f,
        text: player.nick,
        icon: PLAYERS_CARS_ICONS[player.kind],
        css: {
          backgroundColor,
          opacity: current ? 1.0 : 0.5,
          zIndex: current ? 2 : 1,

          '&:after': {
            content: '""',
            position: 'absolute',
            top: '100%',
            left: '50%',
            marginLeft: `-${arrowSize}px`,
            width: 0,
            height: 0,
            borderTop: `solid ${arrowSize}px ${backgroundColor}`,
            borderLeft: `solid ${arrowSize}px transparent`,
            borderRight: `solid ${arrowSize}px transparent`,
          },
        },
      },
    );

    this.player = player;
  }

  update(interpolate, cachedInterpolatedBody) {
    this.translate.xy = cachedInterpolatedBody.pos;
    if (interpolate.fixedStepUpdate)
      this.setIcon(PLAYERS_CARS_ICONS[this.player.kind]);
  }
}

/**
 * @see
 *  CarNode receives mesh size both from server and client
 *  for CarPhysicsBody it will be better to use server size
 */
export default class CarNode extends PhysicsMeshNode {
  constructor(
    {
      player,
      type,
      ...meshConfig
    },
  ) {
    super(
      {
        ...meshConfig,
        physicsBodyEngine: CarPhysicsBody,
        renderer: createTexturedCarRenderer(meshConfig.f)(type),
      },
    );

    this.player = player;
    this.type = type;
  }

  setRenderer(renderer) {
    const {player, f} = this;

    super.setRenderer(renderer);

    this.wireframe = new CarNodeEffects(
      f, this,
      {
        renderBorders: player.current,
        wireframeColor: hexToVec4(player.racingState.color),
      },
    );

    this.nickNode = new PlayerNickTextNode(
      {
        f,
        player,
      },
    );
  }

  release() {
    const {nickNode} = this;

    super.release();
    nickNode && nickNode.release();
  }

  update(interpolate) {
    super.update(interpolate);

    const {nickNode, cachedInterpolatedBody} = this;
    nickNode.update(interpolate, cachedInterpolatedBody);
  }

  render(interpolate, mpMatrix, f) {
    const {nickNode} = this;

    nickNode && nickNode.render(interpolate, mpMatrix, f);
    super.render(interpolate, mpMatrix);
  }
}
