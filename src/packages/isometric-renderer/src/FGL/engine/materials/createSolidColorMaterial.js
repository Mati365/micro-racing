import {glsl} from '../../core/material/types';

const createSolidColorMaterial = fgl => fgl.material.shader(
  {
    shaders: {
      vertex: glsl`
        in vec4 inVertexPos;

        uniform mat4 mpMatrix;

        void main() {
          gl_Position = inVertexPos * mpMatrix;
        }
      `,

      fragment: glsl`
        out vec4 fragColor;

        uniform vec4 color;

        void main() {
          fragColor = color;
        }
      `,
    },
  },
);

export default createSolidColorMaterial;
