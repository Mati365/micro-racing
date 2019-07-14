export const MAGIC_LAYER_TAG = 'canvas-html-wrapper';

const appendCanvasHTMLNode = canvas => (
  {
    tag,
    children,
    cssText,
  },
) => {
  let {parentNode} = canvas;

  // create relative container if not present
  if (parentNode.tagName !== MAGIC_LAYER_TAG) {
    const canvasHTMLWrapper = document.createElement(MAGIC_LAYER_TAG);
    canvasHTMLWrapper.style.cssText = `
      display: inline-block;
      position: relative;
      overflow: hidden;
    `;

    parentNode.insertBefore(canvasHTMLWrapper, canvas);
    canvasHTMLWrapper.appendChild(canvas);

    parentNode = canvasHTMLWrapper;
  }

  // append elements
  const node = document.createElement(tag);
  node.style.cssText = cssText;
  node.innerHTML = children;

  parentNode.appendChild(node);
  return node;
};

export default appendCanvasHTMLNode;
