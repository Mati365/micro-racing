const promiseLoadImage = path => (
  fetch(path).then(r => r.text())
);

export default promiseLoadImage;
