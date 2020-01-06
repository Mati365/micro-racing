import fs from 'fs';
import path from 'path';

const COMPRESSIONS = [
  {
    encoding: 'br',
    extension: 'br',
  },
  {
    encoding: 'gzip',
    extension: 'gz',
  },
];

const serveCompressed = ({publicPath, contentType}) => (req, res, next) => {
  const acceptedEncodings = req.acceptsEncodings();
  const file = req.url.split('/').pop();

  const compression = COMPRESSIONS.find(
    c => (
      acceptedEncodings.indexOf(c.encoding) !== -1
      && fs.existsSync(
        path.join(publicPath, `${file}.${c.extension}`),
      )
    ),
  );

  if (compression) {
    req.url = `${req.url}.${compression.extension}`;
    res.set('Content-Encoding', compression.encoding);
    res.set('Content-Type', contentType);
  }

  next();
};

export default serveCompressed;
