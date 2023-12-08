import * as React from 'react';

import SearchPage from '../../pages/SearchPage/SearchPage';
import icon from '../../shared/images/search.svg';
import { SubApp } from '..';

const title = 'Search';
const namespace = 'search';
const requireLogin = true;
const description = 'Search through data added to Nexus Delta by you and others';
const subAppType = 'internal';
const version = 'β';

const subappProps = {
  subAppType,
  title,
  namespace,
  icon,
  requireLogin,
  description,
  version,
};

export const SearchSubappContext = React.createContext<{
  title: string;
  namespace: string;
  icon: string;
  version: string;
  requireLogin: boolean;
}>(subappProps);

export function useSubappContext() {
  const searchProps = React.useContext(SearchSubappContext);

  return searchProps;
}

export const SearchSubappProviderHOC = (component: React.FunctionComponent) => {
  return () => (
    <SearchSubappContext.Provider value={subappProps}>{component({})}</SearchSubappContext.Provider>
  );
};

const Search: SubApp = () => {
  return {
    ...subappProps,
    routes: [
      {
        path: '/',
        exact: true,
        component: SearchSubappProviderHOC(SearchPage),
        protected: true,
      },
    ],
  };
};

export default Search;
