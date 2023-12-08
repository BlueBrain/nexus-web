import { Link, Observable, Operation } from '@bbp/nexus-link';
import { createNexusClient } from '@bbp/nexus-sdk/es';
import { createBrowserHistory } from 'history';

import defaultState from './defaultState';
import configureStore from './shared/store';
import { SEARCH_PREFENCE_LOCAL_STORAGE_KEY } from './shared/store/actions/search';
import { RootState } from './shared/store/reducers';

let preferredRealm, searchPrefenceLocalStorag;
try {
  const realmData = JSON.parse(localStorage.getItem('nexus__realm') || '');
  realmData && (preferredRealm = realmData.label);
  searchPrefenceLocalStorag = localStorage.getItem(SEARCH_PREFENCE_LOCAL_STORAGE_KEY);
} catch (e) {
  preferredRealm = undefined;
}

const rawBase: string = (window as any)['__BASE__'] || '/';
const base: string = rawBase.replace(/\/$/, '');

const history = createBrowserHistory({ basename: base });
const preloadedState: RootState = window.__PRELOADED_STATE__ || defaultState;

// nexus client middleware for setting token before request
const setToken: Link = (operation: Operation, forward?: Link) => {
  const token = localStorage.getItem('nexus__token');
  const nextOperation = token
    ? {
        ...operation,
        headers: {
          ...operation.headers,
          Authorization: `Bearer ${token}`,
        },
      }
    : operation;
  return forward ? forward(nextOperation) : new Observable();
};

// create Nexus instance
const nexus = createNexusClient({
  fetch,
  uri: preloadedState?.config?.apiEndpoint,
  links: [setToken],
});

const store = configureStore(
  history,
  { nexus },
  {
    ...preloadedState,
    config: {
      ...(preloadedState?.config ?? {}),
      preferredRealm,
    },
    search: {
      ...(preloadedState?.search ?? {}),
      searchPreference: searchPrefenceLocalStorag,
    },
  }
);

export { history, nexus };
export type TStore = typeof store;

export { configureStore };
export default store;
