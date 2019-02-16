const promiseLoadImage = path => new Promise(
  (resolve, reject) => {
    const img = new Image;
    img.src = path;
    img.onload = () => resolve(img);
    img.onerror = e => reject(e);
  },
);

export default promiseLoadImage;
