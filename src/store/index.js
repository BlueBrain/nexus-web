import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk'
import history from '../libs/history';
import getInitialState from './initial-state';
import * as customReducers from './reducers';

const pickInitialState = {
  org: '',
  domain: '',
  schema: '',
  instance: ''
}

const pickReducer = (state = pickInitialState, action) => {
  const { org, domain, schema, ver, instance, type } = action;
  switch (type) {
    case "ALL_PICK":
      return Object.assign({}, state, { org, domain, schema, ver, instance });
    default:
      return state;
  }
}

const configReducer = (state = getInitialState()) => state

const reducers = combineReducers({
  ...customReducers,
  config: configReducer,
  pick: pickReducer,
  routing: routerReducer
})

const middleware = [ thunk, routerMiddleware(history) ]

const reduxStore = createStore(
  reducers,
  compose(
    applyMiddleware(
        ...middleware
    )
  )
)

export default reduxStore;
