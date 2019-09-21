import {singleClassCSS} from '@pkg/fast-stylesheet';
import {vec2, vec4, mat} from '@pkg/gl-math';

const FLOATING_HTML_TEXT_CLASS = singleClassCSS(
  {
    display: 'none',
    position: 'absolute',
    left: 0,
    top: 0,
    userSelect: 'none',
    fontSize: 12,
    fontWeight: 700,
    fontSmooth: 'never',
  },
).className;

/**
 * @see
 *  It is HTML text node rendered over cars etc.
 *  Depth testing is not working!
 *
 *  Node is default hidden to set interpolated
 *  mpMatrix position during render
 */
export default class HTMLTextNode {
  constructor({
    f,
    text,
    opacity = 1.0,
    margin = vec2(0, -55), // in pixels
    translate = vec4(0, 0, 0, 1),
    outlineColor = f.colors.hex.BLACK,
    color = f.colors.hex.WHITE,
    css,
  }) {
    this.text = text;
    this.translate = translate;
    this.margin = margin;

    this.cache = {
      translateMatrix: mat.create(1, 4),
    };

    this.initialHidden = true;
    this.htmlNode = f.appendCanvasHTMLNode(
      {
        tag: 'span',
        children: text,
        css: {
          composes: [FLOATING_HTML_TEXT_CLASS],
          color,
          opacity: (
            opacity && opacity !== 1.0
              ? opacity
              : null
          ),
          textShadow: (
            outlineColor
              ? `-1px 0 ${outlineColor}, 0 1px ${outlineColor}, 1px 0 ${outlineColor}, 0 -1px ${outlineColor}`
              : ''
          ),
          ...css,
        },
      },
    );
  }

  release() {
    this.htmlNode.remove();
    this.htmlNode = null;
  }

  render(interpolate, mpMatrix, f) {
    const {canvasDimensions} = f.state;
    const {
      text,
      htmlNode,
      initialHidden,
      translate,
      margin,
      cache,
    } = this;

    if (!text)
      return;

    const {array} = mat.mul(
      mpMatrix,
      vec4.toMatrix(translate),
      cache.translateMatrix,
    );

    const halfWidth = canvasDimensions.w / 2;
    const halfHeight = canvasDimensions.h / 2;

    const x = Math.floor(array[0] * halfWidth + halfWidth + margin.x);
    const y = Math.floor(-array[1] * halfHeight + halfHeight + margin.y);

    if (x !== cache.prevX || y !== cache.prevY) {
      htmlNode.style.transform = `translate(
        calc(${x}px - 50%),
        calc(${y}px - 50%)
      )`;
    }

    cache.prevX = x;
    cache.prevY = y;

    if (initialHidden) {
      htmlNode.style.display = 'initial';
      this.initialHidden = false;
    }
  }
}
