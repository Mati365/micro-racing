const importBlobFromFile = () => new Promise((resolve, reject) => {
  const input = document.createElement('input');

  input.type = 'file';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader;

    reader.readAsArrayBuffer(file);
    reader.onload = ({target: {result}}) => resolve(result);
    reader.onerror = reject;
  };

  input.click();
});

export default importBlobFromFile;
