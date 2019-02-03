import createMatrix from '../createMatrix';

const transpose = ({array, w, h}) => {
  const result = createMatrix(h, w);
  const {array: output} = result;

  for (let i = w - 1; i >= 0; --i) {
    for (let j = h - 1; j >= 0; --j) {
      output[j * w + i] = array[i * h + j];
    }
  }

  return result;
};

export default transpose;
