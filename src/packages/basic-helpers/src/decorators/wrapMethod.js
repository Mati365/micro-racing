const wrapMethod = decorator => (target, propertyKey, descriptor) => ({
  configurable: true,
  get() {
    const method = decorator.apply(
      target,
      [
        descriptor.value.bind(this),
        this,
      ],
    );
    Object.defineProperty(this, propertyKey, {
      value: method,
      configurable: true,
      writable: true,
    });
    return method;
  },
});

export default wrapMethod;
