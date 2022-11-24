import * as React from 'react';
import { SubApp } from '..';
export declare const SearchSubappContext: React.Context<{
  title: string;
  namespace: string;
  icon: string;
  version: string;
  requireLogin: boolean;
}>;
export declare function useSubappContext(): {
  title: string;
  namespace: string;
  icon: string;
  version: string;
  requireLogin: boolean;
};
export declare const SearchSubappProviderHOC: (
  component: React.FunctionComponent
) => () => JSX.Element;
declare const Search: SubApp;
export default Search;
