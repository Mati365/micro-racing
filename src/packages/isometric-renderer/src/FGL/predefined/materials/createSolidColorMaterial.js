const createSolidColorMaterial = fgl => fgl.material.shader(
  {
    shaders: {
      vertex: `
        in vec4 inVertexPos;

        uniform mat4 mpMatrix;

        void main() {
          gl_Position = inVertexPos * mpMatrix;
        }
      `,

      fragment: `
        out vec4 fragColor;

        uniform vec4 color;

        void main() {
          fragColor = color;
          // fragColor = vec4(gl_FragCoord.z); // depth buffer test
        }
      `,
    },
  },
);

export default createSolidColorMaterial;
