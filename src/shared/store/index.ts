import {
  createStore,
  combineReducers,
  applyMiddleware,
  compose,
  Store,
} from 'redux';
import thunk, { ThunkAction } from 'redux-thunk';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { reducer as oidcReducer } from 'redux-oidc';
import { History } from 'history';
import Nexus from '@bbp/nexus-sdk';
import reducers, { RootState } from './reducers';
import { saveState, loadState } from './reducers/localStorage';
import { persistanceMapper, ListsByProjectState } from './reducers/lists';

export type Services = {
  nexus: Nexus;
};

export type ThunkAction = ThunkAction<Promise<any>, object, Services, any>;

let composeEnhancers: Function = compose;
try {
  // DEVELOPMENT ONLY
  // if the Redux Devtools browser extension is present,
  // enable its debugging capabilities.
  if ((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  }
} catch (e) {
  composeEnhancers = compose;
}

export default function configureStore(
  history: History,
  nexus: Nexus,
  preloadedState: any = {}
): Store {
  // ignore server lists, fetch from local storage when available
  preloadedState.lists = { ...loadState('lists') };
  const store = createStore(
    // @ts-ignore
    combineReducers({
      router: connectRouter(history),
      oidc: oidcReducer,
      ...reducers,
    }),
    preloadedState,
    composeEnhancers(
      applyMiddleware(
        thunk.withExtraArgument({ nexus }),
        routerMiddleware(history)
      )
    )
  );

  // persist these in the client
  store.subscribe(() => {
    saveState({
      lists: persistanceMapper((store.getState() as RootState)
        .lists as ListsByProjectState),
    });
  });

  // DEVELOPMENT ONLY
  // if Hot module Replacement is enabled
  // replace store's reducers with new ones.
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const newReducers = require('./reducers');
      store.replaceReducer(newReducers);
    });
  }
  return store;
}
