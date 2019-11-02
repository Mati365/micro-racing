import * as R from 'ramda';

const exportBlobToFile = R.curry(
  (filename, blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
);

export default exportBlobToFile;
