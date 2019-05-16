import attachShaderMaterialParameters from './utils/attachShaderMaterialParameters';

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
    mesh: {
      instance: mesh,
    },
  },
) => {
  const buffer = [];

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
    } = mesh;

    mesh.attachBuffers();

    for (let i = 0, n = buffer.length; i < n; ++i) {
      attachShaderMaterialParameters(material, buffer[i]);
      mesh.drawVertexBuffer();
    }

    mesh.detachBuffers();
    buffer.length = 0;
  };

  return Object.assign(
    render,
    {
      batch: appendToBuffer,
    },
  );
};

export default createMeshBatch;
