const getDOMElementSize = (element) => {
  const rect = element.getBoundingClientRect();

  return {
    w: rect.width,
    h: rect.height,
  };
};

export default getDOMElementSize;
