import * as React from 'react';
import { SubApp } from '..';
import SearchView from './views/SearchView';

const title = 'Search';
const namespace = 'search';
const icon = require('../../shared/images/search.svg');

const subappProps = {
  title,
  namespace,
  icon,
};

export const SearchSubappContext = React.createContext<{
  title: string;
  namespace: string;
  icon: string;
}>(subappProps);

export function useSubappContext() {
  const searchProps = React.useContext(SearchSubappContext);

  return searchProps;
}

export const SearchSubappProviderHOC = (component: React.FunctionComponent) => {
  return () => (
    <SearchSubappContext.Provider value={subappProps}>
      {component({})}
    </SearchSubappContext.Provider>
  );
};

const Search: SubApp = () => {
  return {
    ...subappProps,
    routes: [
      {
        path: '/',
        exact: true,
        component: SearchSubappProviderHOC(SearchView),
      },
    ],
  };
};

export default Search;
