import * as R from 'ramda';

export default class RoadWireframe {
  constructor(f, sceneNode) {
    const {segmentsInfo, renderConfig} = sceneNode;
    const {innerPath, path, outerPath} = segmentsInfo;

    this.f = f;
    this.sceneNode = sceneNode;
    this.renderConfig = renderConfig;
    this.meshes = R.map(
      vertices => f.mesh(
        {
          renderMode: f.flags.LINE_LOOP,
          material: f.material.solidColor,
          vertices,
          transform: {
            translate: [0.0, 0.0, -0.1],
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
      meshes[i](this.renderConfig);
  }
}
