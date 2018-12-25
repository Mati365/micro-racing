import React from 'react';
import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';

export default class GameCanvas extends React.Component {
  static propTypes = {
    dimensions: DIMENSIONS_SCHEMA.isRequired,
  };

  canvasRef = React.createRef();

  render() {
    const {dimensions} = this.props;

    return (
      <canvas
        ref={this.canvasRef}
        style={dimensions}
      />
    );
  }
}
