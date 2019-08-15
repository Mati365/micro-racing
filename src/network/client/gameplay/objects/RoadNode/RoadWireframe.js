import * as R from 'ramda';

export default class RoadWireframe {
  constructor(f, pathInfo) {
    const {innerPath, path, outerPath} = pathInfo;

    this.meshes = R.map(
      vertices => f.mesh(
        {
          renderMode: f.flags.LINE_LOOP,
          material: f.material.solidColor,
          vertices,
          uniforms: {
            color: f.colors.RED,
          },
          transform: {
            translate: [0.0, 0.0, -0.01],
          },
        },
      ),
      [
        innerPath,
        path,
        outerPath,
      ],
    );
  }

  render() {
    const {meshes} = this;

    for (let i = meshes.length - 1; i >= 0; --i)
      meshes[i]();
  }
}
