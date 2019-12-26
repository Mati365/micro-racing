import {
  relativeEventPos,
  assignElementListeners,
  getElementDimensions,
} from '@pkg/basic-helpers';

export default class AbstractDraggableEditorLayer {
  constructor(layerDisplayName) {
    this.layerDisplayName = layerDisplayName;
    this.scale = 1.0;
  }

  getRelativeEventPos(e) {
    return relativeEventPos(e, 1 / this.scale);
  }

  onDragStart = (e) => {
    const {handlers} = this;
    const draggableElement = handlers.findElementByCoords?.(
      this.getRelativeEventPos(e)
    ) || null;

    this.draggingElement = draggableElement;
    if (draggableElement) {
      draggableElement.item.active = true;

      this.setFocused(draggableElement);
      this.render();
    }
  };

  onDragMove = (e) => {
    const {
      handlers,
      draggingElement,
      suppressMove,
    } = this;

    if (!draggingElement || suppressMove)
      return;

    handlers.updateElementPos?.(
      this.draggingElement,
      this.getRelativeEventPos(e),
    );

    this.render();
  };

  onDragEnd = () => {
    const {draggingElement} = this;
    if (draggingElement) {
      draggingElement.item.active = false;
      this.render();
    }

    // due to prevent default click handler issues add timer
    this.suppressMove = true;
    setTimeout(
      () => {
        this.suppressMove = false;
        this.draggingElement = null;
      },
      100,
    );
  };

  onKeydown = (e) => {
    const {handlers, focused} = this;

    if (e.keyCode === 46 && focused) {
      handlers.removeElement?.(focused);
      this.render();
    }
  };

  onClick = (e) => {
    const {handlers} = this;

    handlers.handleClick?.(
      this.getRelativeEventPos(e),
    );
  }

  setActionHandlers(handlers) {
    this.handlers = handlers;
    return this;
  }

  setFocused(element) {
    // focus is not cleared after drag
    if (this.focused)
      this.focused.item.focused = false;

    this.focused = element;
    element.item.focused = true;
  }

  setCanvas(
    {
      canvas,
      dimensions,
    },
  ) {
    this.canvas = canvas;
    this.dimensions = dimensions || getElementDimensions(canvas);
    this.ctx = canvas.getContext('2d');

    const {w, h} = this.dimensions;
    Object.assign(
      canvas,
      {
        imageSmoothingEnabled: false,
        width: w,
        height: h,
      },
    );

    this.listeners?.();
    this.listeners = assignElementListeners(
      {
        click: this.onClick,
        mousedown: this.onDragStart,
        mousemove: this.onDragMove,
        mouseup: this.onDragEnd,
        keydown: this.onKeydown,
      },
      canvas,
    );

    this.render();
    return this;
  }

  render({postrender, prerender} = {}) {
    const {
      scale,
      ctx,
      dimensions,
    } = this;

    // cleanup
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, dimensions.w, dimensions.h);

    prerender && prerender();

    ctx.save();
    ctx.scale(scale, scale);

    postrender && postrender();

    ctx.restore();
  }
}
