const sumDistances = vec2 => (points) => {
  const l = points.length;
  if (l < 2)
    return 0;

  let acc = 0;
  for (let i = l - 1; i >= 1; --i)
    acc += vec2.dist(points[i], points[i - 1]);

  return acc;
};

export default sumDistances;
