import * as R from 'ramda';

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

/**
 * @see
 *  CarNode receives mesh size both from server and client
 *  for CarPhysicsBody it will be better to use server size
 */
export default class CarNode extends PhysicsMeshNode {
  constructor({
    player,
    type,
    ...meshConfig
  }) {
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

    this.wireframe = new CarNodeEffects(f, this);
    this.nickNode = new HTMLTextNode(
      {
        f,
        text: player.nick,
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

    const {nickNode, interpolatedBody} = this;
    if (nickNode)
      nickNode.translate.xy = interpolatedBody.pos;
  }

  render(interpolate, mpMatrix, f) {
    const {nickNode} = this;

    nickNode && nickNode.render(interpolate, mpMatrix, f);
    super.render(interpolate, mpMatrix);
  }
}
