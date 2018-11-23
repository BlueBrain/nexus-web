import {
  createStore,
  combineReducers,
  applyMiddleware,
  compose,
  Store,
} from 'redux';
import thunk from 'redux-thunk';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { History } from 'history';
import Nexus from 'nexus-sdk';
import reducers from './reducers';

export default function configureStore(
  history: History,
  preloadedState: object = {}
): Store {
  const nexus = new Nexus({
    environment: 'https://bbp-nexus.epfl.ch/staging/v1',
    token: '',
  });
  const store = createStore(
    combineReducers({ router: connectRouter(history), ...reducers }),
    preloadedState,
    compose(
      // TODO: add dev tools
      applyMiddleware(
        thunk.withExtraArgument({ nexus }),
        routerMiddleware(history)
      )
    )
  );

  // DEVELOPMENT ONLY
  // if Hot module Replacement is enables
  // replace store's reducers with new ones.
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const newReducers = require('./reducers');
      store.replaceReducer(newReducers);
    });
  }
  return store;
}

// export default reduxStore;
