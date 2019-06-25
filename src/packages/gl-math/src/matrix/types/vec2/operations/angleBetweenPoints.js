const angleBetweenPoints = (a, b) => Math.atan2(
  a[1] - b[1],
  a[0] - b[0],
);

export default angleBetweenPoints;
