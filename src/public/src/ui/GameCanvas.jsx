import React from 'react';
import {DIMENSIONS_SCHEMA} from '@pkg/basic-type-schemas';

export default class GameCanvas extends React.Component {
  static propTypes = {
    dimensions: DIMENSIONS_SCHEMA.isRequired,
  };

  canvasRef = React.createRef();

  componentDidMount() {
    const {current: node} = this.canvasRef;
    const gl = node.getContext('webgl2');

    /**
     * @todo
     * Add parent component with componentDidCatch, ... or
     * use state flag inside this component
     */
    if (!gl)
      throw new Error('WebGL2 is not supported!');

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

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
