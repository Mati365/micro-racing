import * as R from 'ramda';
import {singleClassCSS} from '@pkg/fast-stylesheet';

export const MAGIC_LAYER_TAG = 'canvas-html-wrapper';

const appendCanvasHTMLNode = canvas => (
  {
    tag,
    children,
    css,
    className,
  },
) => {
  let {parentNode} = canvas;

  // create relative container if not present
  let canvasHTMLWrapper = parentNode;
  if (R.toLower(canvasHTMLWrapper.tagName) !== MAGIC_LAYER_TAG) {
    canvasHTMLWrapper = document.createElement(MAGIC_LAYER_TAG);

    parentNode.insertBefore(canvasHTMLWrapper, canvas);
    canvasHTMLWrapper.appendChild(canvas);

    parentNode = canvasHTMLWrapper;
  }

  canvasHTMLWrapper.className = singleClassCSS(
    {
      display: 'inline-block',
      position: 'relative',
      overflow: 'hidden',

      '& canvas': {
        outline: 0,
      },
    },
  ).className;

  // append elements
  const node = document.createElement(tag);

  if (R.is(String, children))
    node.innerHTML = children;
  else
    node.appendChild(children);

  if (className)
    node.classList.add(className);

  if (css) {
    const sheet = singleClassCSS(css);

    node.classList.add(...R.split(' ', sheet.className));
    node.addEventListener('DOMNodeRemoved', () => {
      sheet.remove();
    });
  }

  parentNode.appendChild(node);
  return node;
};

export default appendCanvasHTMLNode;
