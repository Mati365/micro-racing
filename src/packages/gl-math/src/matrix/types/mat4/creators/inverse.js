import mat3 from '../../mat3';

/**
 * @see {@link https://stackoverflow.com/a/18504573}
 */
const inverse = ({array: mat}, dest) => {
  if (!dest)
    dest = mat3();

  const det = (
    mat[0] * (mat[5] * mat[10] - mat[6] * mat[9])
      - mat[4] * (mat[1] * mat[10] - mat[9] * mat[2])
      + mat[8] * (mat[1] * mat[6] - mat[5] * mat[2])
  );

  const invDet = 1.0 / det;
  const {array: output} = dest;

  output[0] = (mat[5] * mat[10] - mat[6] * mat[9]) * invDet;
  output[1] = -(mat[8] * mat[6] - mat[4] * mat[10]) * invDet;
  output[2] = (mat[4] * mat[9] - mat[8] * mat[5]) * invDet;
  output[3] = -(mat[9] * mat[2] - mat[1] * mat[10]) * invDet;
  output[4] = (mat[0] * mat[10] - mat[8] * mat[2]) * invDet;
  output[5] = -(mat[1] * mat[8] - mat[0] * mat[9]) * invDet;
  output[6] = (mat[1] * mat[6] - mat[2] * mat[5]) * invDet;
  output[7] = -(mat[2] * mat[4] - mat[0] * mat[6]) * invDet;
  output[8] = (mat[0] * mat[5] - mat[1] * mat[4]) * invDet;

  return dest;
};

export default inverse;
