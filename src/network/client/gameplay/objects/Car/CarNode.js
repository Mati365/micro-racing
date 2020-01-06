import * as R from 'ramda';

import {PLAYERS_CARS_ICONS} from '@game/shared/sceneResources/icons';

import {hexToVec4} from '@pkg/isometric-renderer/FGL/core/utils';
import {fetchCarMeshURLResource} from '@game/shared/sceneResources/cars';

import {HTMLTextNode} from '@pkg/isometric-renderer/FGL/engine/scene';
import CarPhysicsBody from '@game/shared/logic/physics/CarPhysicsBody';

import CarNodeEffects from './CarNodeEffects';
import PhysicsMeshNode from '../PhysicsMeshNode';

export const createTexturedCarRenderer = f => R.memoizeWith(
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
export const FLASH_INTERVAL = 5; // * 30ms

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
        renderer: meshConfig.renderer || createTexturedCarRenderer(meshConfig.f)(type),
      },
    );

    this.ignoreRenderCulling = true;
    this.player = player;
    this.type = type;
    this.flashCounter = FLASH_INTERVAL;
    this.assignEffects();
  }

  setRenderer(renderer) {
    this.assignEffects();
    super.setRenderer(renderer);
  }

  assignEffects() {
    const {player, f} = this;
    if (!player)
      return;

    this.wireframe?.release();
    this.wireframe = new CarNodeEffects(
      f, this,
      {
        renderBorders: player.current,
        wireframeColor: hexToVec4(player.racingState.color),
      },
    );

    this.nickNode?.release();
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

    const {
      player,
      nickNode,
      renderConfig,
      cachedInterpolatedBody,
    } = this;

    nickNode && nickNode.update(interpolate, cachedInterpolatedBody);
    if (player && interpolate.fixedStepUpdate) {
      const {racingState} = player;
      let opacity = 1.0;

      if (racingState.isFinish())
        opacity = 0.25;
      else if (racingState.isFlashing()) {
        this.flashCounter--;
        if (this.flashCounter < -FLASH_INTERVAL)
          this.flashCounter = FLASH_INTERVAL;

        if (this.flashCounter > 0)
          opacity = 0.15;
        else
          opacity = 0.9;
      } else if (racingState.isFreezed())
        opacity = 0.5;

      renderConfig.uniforms.opacity = opacity;
    }
  }

  render(interpolate, mpMatrix, f) {
    const {wireframe, nickNode, inViewport, prevInViewport} = this;

    if (nickNode) {
      nickNode.prevInViewport = prevInViewport;
      nickNode.inViewport = inViewport;
      nickNode.render(interpolate, mpMatrix, f);
    }

    if (inViewport === false)
      wireframe.renderTracks(interpolate, mpMatrix);
    else
      super.render(interpolate, mpMatrix);
  }
}
