const createTextureSpriteMaterial = fgl => fgl.material.shader(
  {
    shaders: {
      vertex: `
        layout(location = 0) in vec3 position;
        layout(location = 1) in vec3 normal;
        layout(location = 2) in vec2 uv;
        layout(location = 3) in int mtl;

        uniform mat4 mpMatrix;

        out vec2 vUVPos;

        void main() {
          gl_Position = vec4(position, 1.0) * mpMatrix;
          vUVPos = uv;
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
