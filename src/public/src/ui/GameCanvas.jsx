import React from 'react';

import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';
import fgl from '@pkg/isometric-renderer';

export default class GameCanvas extends React.Component {
  static propTypes = {
    dimensions: DIMENSIONS_SCHEMA.isRequired,
  };

  canvasRef = React.createRef();

  componentDidMount() {
    const {current: canvasNode} = this.canvasRef;

    const renderer = fgl(canvasNode);
    renderer.frame(() => {
      renderer.clear();
    });
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
