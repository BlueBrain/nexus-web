import {
  createStore,
  combineReducers,
  applyMiddleware,
  compose,
  Store,
} from 'redux';
import thunk, { ThunkAction as ReduxThunkAction } from 'redux-thunk';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { reducer as oidcReducer } from 'redux-oidc';
import { History } from 'history';
import { NexusClient } from '@bbp/nexus-sdk/es';
import reducers from './reducers';
import { DataExplorerFlowSliceListener } from './reducers/data-explorer';

export type Services = {
  nexus: NexusClient;
};

export type ThunkAction = ReduxThunkAction<Promise<any>, object, Services, any>;

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
  { nexus }: { nexus: NexusClient },
  preloadedState: any = {}
): Store {
  // ignore server lists, fetch from local storage when available
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
        routerMiddleware(history),
        DataExplorerFlowSliceListener.middleware
      )
    )
  );
  // DEVELOPMENT ONLY
  // if Hot module Replacement is enabled
  // replace store's reducers with new ones.

  return store;
}
