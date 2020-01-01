import fs from 'fs';
import path from 'path';

const writeJSONToFile = async ({filename}, track) => {
  try {
    await fs.promises.mkdir(
      path.dirname(filename),
      {
        recursive: true,
      },
    );

    await fs.promises.writeFile(
      filename,
      JSON.stringify(track),
      'utf8',
    );
  } catch (e) {
    console.error(e);
    return false;
  }

  return true;
};

export default writeJSONToFile;
