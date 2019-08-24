import React, {useContext} from 'react';

export const SheetStoreContext = React.createContext(null);

export const useSheetStoreContext = () => useContext(SheetStoreContext);

export default SheetStoreContext.Provider;
