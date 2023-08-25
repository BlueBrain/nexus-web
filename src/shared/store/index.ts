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
import { createLogger } from 'redux-logger';
import { History } from 'history';
import { NexusClient } from '@bbp/nexus-sdk';
import reducers, { RootState } from './reducers';
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
const logger = createLogger({});

function configureStore(
  history: History,
  { nexus }: { nexus: NexusClient },
  preloadedState: any = {}
): Store<RootState> {
  let middlwares = [
    thunk.withExtraArgument({ nexus }),
    routerMiddleware(history),
    DataExplorerFlowSliceListener.middleware,
  ];

  // @ts-ignore
  if (import.meta.env.MODE === 'development') {
    middlwares = [...middlwares, logger];
  }
  const store = createStore(
    // @ts-ignore
    combineReducers({
      router: connectRouter(history),
      oidc: oidcReducer,
      ...reducers,
    }),
    preloadedState,
    composeEnhancers(applyMiddleware(...middlwares))
  );

  return store;
}

export default configureStore;
