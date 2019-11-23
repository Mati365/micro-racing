import SceneNode from './SceneNode';
import {Light} from '../../lighting';

export default class LightNode extends SceneNode {
  constructor({f, light}) {
    super(
      {
        renderer: f.mesh.box(),
        uniforms: {
          color: f.colors.PURPLE,
        },
        transform: {
          scale: [0.25, 0.25, 0.25],
          translate: light.pos,
        },
      },
    );

    // do not change reference! mem leak in SceneBuffer
    this.light = new Light(light);
  }

  setScene(scene) {
    const oldScene = this.scene;
    const {light} = this;

    if (!scene && oldScene)
      oldScene.lights.remove(light);

    scene.lights.append(light);
    super.setScene(scene);
  }
}
