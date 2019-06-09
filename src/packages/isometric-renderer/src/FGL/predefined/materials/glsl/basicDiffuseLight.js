import {glsl} from '../../../material/types';

export default glsl`
  vec4 calcDiffuseLight(
    vec3 lightVector,
    vec3 rotatedNormal,
    float intense
  ) {
    float diffuse = clamp(
      dot(
        normalize(rotatedNormal),
        normalize(lightVector)
      ) * intense * 1.6,
      0.0,
      1.0
    );

    return vec4(diffuse, diffuse, diffuse, 1.0);
  }
`;
