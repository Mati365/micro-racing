import * as R from 'ramda';

import {fetchCarMeshURLResource} from '@game/shared/sceneResources/cars';

import {
  HTMLTextNode,
  MeshNode,
} from '@pkg/isometric-renderer/FGL/engine/scene';

import CarPhysicsBody from '@game/logic/physics/CarPhysicsBody';
import CarNodeEffects from './CarNodeEffects';

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
export default class CarNode extends MeshNode {
  constructor({
    f,
    player,
    type,
    body,
    ...meshConfig
  }) {
    super(
      {
        ...meshConfig,
        renderer: createTexturedCarRenderer(f)(type),
      },
    );

    this.f = f;
    this.player = player;
    this.type = type;
    this.bodyConfig = body;
  }

  setRenderer(renderer) {
    const {player, f, bodyConfig} = this;

    super.setRenderer(renderer);

    if (bodyConfig) {
      if (bodyConfig instanceof CarPhysicsBody)
        this.body = bodyConfig;
      else
        this.body = CarPhysicsBody.fromJSON(bodyConfig);
    } else {
      this.body = new CarPhysicsBody(
        {
          angle: this.rotate.z,
          pos: this.translate,
          size: this.size.toVec(),
        },
      );
    }

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
    const {
      nickNode, body,
      translate, rotate,
    } = this;

    if (!body)
      return;

    // physics is slower than renderer
    // interpolate between frames
    const interpolatedBody = body.interpolatedUpdate(interpolate);

    rotate.z = interpolatedBody.angle;
    translate.xy = interpolatedBody.pos;
    nickNode.translate.xy = interpolatedBody.pos;

    this.updateTransformCache();

    // updated linked meshes
    super.update(interpolate);
  }

  render(interpolate, mpMatrix, f) {
    const {nickNode} = this;

    nickNode && nickNode.render(interpolate, mpMatrix, f);
    super.render(interpolate, mpMatrix);
  }
}
