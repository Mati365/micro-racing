const aabb = (boxA, boxB) => {
  const {x: x1, y: y1, w: w1, h: h1} = boxA;
  const {x: x2, y: y2, w: w2, h: h2} = boxB;

  return !(
    x2 + w2 < x1
      || x2 > x1 + w1
      || y2 + h2 < y1
      || y2 > y1 + h1
  );
};

export const contains = (parent, child) => (
  parent.x <= child.x
    && parent.x + parent.w >= child.x + child.w
    && parent.y <= child.y
    && parent.y + parent.h >= child.y + child.h
);

export default aabb;
