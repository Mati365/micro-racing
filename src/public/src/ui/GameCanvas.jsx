import React from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';
import {Scene} from '@pkg/isometric-renderer';

export default class GameCanvas extends React.Component {
  static propTypes = {
    dimensions: DIMENSIONS_SCHEMA.isRequired,
  };

  canvasRef = React.createRef();

  componentDidMount() {
    const {current: canvasNode} = this.canvasRef;

    this.scene = new Scene(
      {
        canvas: canvasNode,
      },
    );
    this.scene.render();
  }

  render() {
    const {dimensions} = this.props;

    return (
      <canvas
        ref={this.canvasRef}
        width={dimensions.width}
        height={dimensions.height}
      />
    );
  }
}
