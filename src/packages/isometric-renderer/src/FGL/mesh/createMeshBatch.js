import attachShaderMaterialParameters from '../material/types/shader/attachShaderMaterialParameters';

/**
 * Reduces bindBuffer() calls rate to mesh()
 *
 * @todo
 *  Add instancing
 *
 * @param {WebGLRenderingContext} gl
 * @param {FGL} fgl
 */
const createMeshBatch = () => (
  {
    mesh,
  },
) => {
  let buffer = [];

  /**
   * Attaches data to mesh
   *
   * @param {Object} data
   */
  const appendToBuffer = (data) => {
    buffer.push(data);
  };

  /**
   * Renders and flushes array
   */
  const render = () => {
    const {
      meshDescriptor: {
        material,
      },
      drawVertexBuffer,
      attachBuffers,
      detachBuffers,
    } = mesh;

    attachBuffers();

    for (let i = 0, n = buffer.length; i < n; ++i) {
      attachShaderMaterialParameters(material, buffer[i]);
      drawVertexBuffer();
    }

    buffer = [];
    detachBuffers();
  };

  return Object.assign(
    render,
    {
      batch: appendToBuffer,
    },
  );
};

export default createMeshBatch;
