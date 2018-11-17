import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

const reduxStore = (preloadedState: object = {}) =>
  createStore(
    reducers,
    preloadedState,
    compose(
      // typeof window === 'object' &&
      //   (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
      //   (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
      applyMiddleware(thunk)
    )
  );

// DEVELOPMENT ONLY
// if Hot module Replacement is enables
// replace store's reducers with new ones.
if (module.hot) {
  module.hot.accept('./reducers', () => {
    const newReducers = require('./reducers');
    reduxStore().replaceReducer(newReducers);
  });
}

export default reduxStore;
