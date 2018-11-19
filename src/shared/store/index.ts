import {
  createStore,
  combineReducers,
  applyMiddleware,
  compose,
  Store,
} from 'redux';
import thunk from 'redux-thunk';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import reducers from './reducers';
import { History } from 'history';

export default function configureStore(
  history: History,
  preloadedState: object = {}
): Store {
  const store = createStore(
    combineReducers({ router: connectRouter(history), ...reducers }),
    preloadedState,
    compose(
      // typeof window === 'object' &&
      //   (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
      //   (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
      applyMiddleware(thunk, routerMiddleware(history))
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
