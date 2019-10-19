const assignI18nPackMiddleware = pack => (req, res, next) => {
  res.locals.i18n = {
    lang: req.acceptsLanguages('pl', 'de', 'en') || 'en',
    pack,
  };

  next();
};

export default assignI18nPackMiddleware;
