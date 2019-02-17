const createTextureSpriteMaterial = fgl => fgl.material.shader(
  {
    shaders: {
      vertex: `
        in vec4 inVertexPos;
        in vec2 inUVPos;

        uniform mat4 mpMatrix;
        out vec2 vUVPos;

        void main() {
          gl_Position = inVertexPos * mpMatrix;
          vUVPos = inUVPos;
        }
      `,

      fragment: `
        out vec4 fragColor;
        in vec2 vUVPos;

        uniform sampler2D tex0;

        void main() {
          fragColor = texture(tex0, vUVPos);
        }
      `,
    },
  },
);

export default createTextureSpriteMaterial;
