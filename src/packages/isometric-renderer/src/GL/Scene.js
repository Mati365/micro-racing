import Renderer from './GLWrapper/Renderer';

export default class Scene {
  constructor({
    gl,
    canvas,
  }) {
    this.gl = gl || canvas?.getContext('webgl2');
    if (!this.gl)
      throw new Error('WebGL2 context is null! Scene cannot be initialized!');

    this.renderer = new Renderer(this.gl);
  }

  render() {
    const {renderer} = this;

    renderer.clear();
  }
}
