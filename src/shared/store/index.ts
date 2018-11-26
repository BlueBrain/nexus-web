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

let composeEnhancers = compose;
try {
  composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
} catch (e) {
  // fail silently
}

export default function configureStore(
  history: History,
  nexus: Nexus,
  preloadedState: object = {}
): Store {
  const store = createStore(
    combineReducers({ router: connectRouter(history), ...reducers }),
    preloadedState,
    composeEnhancers(
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
