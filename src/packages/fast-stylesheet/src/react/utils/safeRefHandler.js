const safeRefHandler = (ref, node) => {
  if (!ref)
    return;

  if ('current' in ref)
    ref.current = node;
  else
    ref(node);
};

export default safeRefHandler;
