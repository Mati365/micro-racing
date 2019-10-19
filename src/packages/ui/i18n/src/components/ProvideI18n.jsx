import React, {useMemo} from 'react';
import PropTypes from 'prop-types';

import createLangPack from '../utils/createLangPack';

export const I18nContext = React.createContext(null);

const ProvideI18n = ({
  children, pack,
  lang, fallbackLang,
}) => {
  const translator = useMemo(
    () => {
      const t = createLangPack(pack).createTranslator(lang, fallbackLang);
      t.lang = lang;
      return t;
    },
    [pack],
  );

  return (
    <I18nContext.Provider value={translator}>
      {children}
    </I18nContext.Provider>
  );
};

ProvideI18n.displayName = 'ProvideI18n';

ProvideI18n.propTypes = {
  pack: PropTypes.objectOf(PropTypes.any),
  lang: PropTypes.string,
  fallbackLang: PropTypes.string,
};

ProvideI18n.defaultProps = {
  pack: {},
  lang: 'en',
  fallbackLang: 'pl',
};

export default ProvideI18n;
