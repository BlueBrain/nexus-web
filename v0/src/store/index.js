import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import persistState from 'redux-localstorage';
import thunk from 'redux-thunk'
import history from '../libs/history';
import * as customReducers from './reducers';

const reducers = combineReducers({
  ...customReducers,
  routing: routerReducer
})

const middleware = [ thunk, routerMiddleware(history) ]

const reduxStore = createStore(
  reducers,
  compose(
    persistState('auth'),
    applyMiddleware(
        ...middleware
    )
  )
)

export default reduxStore;
