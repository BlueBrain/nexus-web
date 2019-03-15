import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { routerReducer, routerMiddleware } from "react-router-redux";
import persistState from "redux-localstorage";
import thunk from "redux-thunk";
import history from "../libs/history";
import * as customReducers from "./reducers";

let composeEnhancers = compose;
try {
  // DEVELOPMENT ONLY
  // if the Redux Devtools browser extension is present,
  // enable its debugging capabilities.
  if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  }
} catch (e) {
  composeEnhancers = compose;
}

const reducers = combineReducers({
  ...customReducers,
  routing: routerReducer
});

const middleware = [thunk, routerMiddleware(history)];

const reduxStore = createStore(
  reducers,
  composeEnhancers(persistState("auth"), applyMiddleware(...middleware))
);

export default reduxStore;
