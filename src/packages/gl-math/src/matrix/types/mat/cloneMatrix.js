const clone = ({array, w, h}) => ({
  w,
  h,
  array: new Float32Array(array),
});

export default clone;
