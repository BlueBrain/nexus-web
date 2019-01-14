import { combineReducers, AnyAction } from 'redux';

export type ActionReducer = (state: any, action: AnyAction) => any;

export interface ActionHandler {
  [actionKey: string]: ActionReducer;
}

export interface ActionTypes {
  FETCHING: string;
  FULFILLED: string;
  FAILED: string;
}

export interface FetchableState<Data> {
  isFetching: boolean;
  data: Data;
  error: Error;
}

export interface AnyFetchableState {
  isFetching: boolean;
  data?: object | object[];
  error?: Error;
}

export const createReducer = (intialState: any, handlers: ActionHandler) => (
  state = intialState,
  action: AnyAction
) =>
  handlers.hasOwnProperty(action.type)
    ? handlers[action.type](state, action)
    : state;

export const createFetching = ({ FETCHING, FULFILLED, FAILED }: ActionTypes) =>
  createReducer(false, {
    [FETCHING]: () => true,
    [FULFILLED]: () => false,
    [FAILED]: () => false,
  });

export const createResultData = (
  { FULFILLED }: ActionTypes,
  initialState: [] | null
) =>
  createReducer(initialState, {
    [FULFILLED]: (state, action) => action.payload,
  });

export const createError = ({ FAILED }: ActionTypes) =>
  createReducer(null, {
    [FAILED]: (state, action) => action.error,
  });

// For single objects
export const createFetchReducer = (actionTypes: ActionTypes) =>
  combineReducers({
    isFetching: createFetching(actionTypes),
    data: createResultData(actionTypes, null),
    error: createError(actionTypes),
  });

// For collections
export const createFetchListReducer = (actionTypes: ActionTypes) =>
  combineReducers({
    isFetching: createFetching(actionTypes),
    data: createResultData(actionTypes, []),
    error: createError(actionTypes),
  });
