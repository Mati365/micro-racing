export const drawRect = (rect, borderWidth, color, ctx) => {
  // fix blurry lines
  const blurOffset = borderWidth <= 1 ? 0.5 : 0;

  ctx.beginPath();
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = color;
  ctx.rect(
    rect.x + blurOffset,
    rect.y + blurOffset,
    rect.w, rect.h,
  );
  ctx.stroke();
};

export const fillRect = (rect, color, ctx) => {
  ctx.fillStyle = color;
  ctx.fillRect(
    rect.x,
    rect.y,
    rect.w,
    rect.h,
  );
};

export const fillCircle = (pos, radius, fill, ctx) => {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
  ctx.fill();
};

export const drawLine = (v1, v2, color, width, ctx) => {
  const blurOffset = width <= 1 ? 0.5 : 0;

  ctx.lineWidth = width;
  ctx.strokeStyle = color;

  ctx.beginPath();
  ctx.moveTo(v1.x + blurOffset, v1.y + blurOffset);
  ctx.lineTo(v2.x + blurOffset, v2.y + blurOffset);
  ctx.stroke();
};

export const drawPolygon = (points, color, width, loop, ctx) => {
  const blurOffset = width <= 1 ? 0.5 : 0;
  const firstPoint = points[0];

  ctx.lineWidth = width;
  ctx.strokeStyle = color;

  ctx.beginPath();
  ctx.moveTo(
    firstPoint.x + blurOffset,
    firstPoint.y + blurOffset,
  );

  for (let i = 1, n = points.length; i < n; ++i) {
    const point = points[i];
    ctx.lineTo(
      point.x + blurOffset,
      point.y + blurOffset,
    );
  }

  if (loop) {
    ctx.lineTo(
      firstPoint.x + blurOffset,
      firstPoint.y + blurOffset,
    );
  }

  ctx.stroke();
};
