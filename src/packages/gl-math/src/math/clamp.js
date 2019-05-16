const clamp = (min, max, value) => Math.min(
  Math.max(value, min),
  max,
);

export default clamp;
