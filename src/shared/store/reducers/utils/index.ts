import { combineReducers, AnyAction, Reducer, Action } from 'redux';

export * from './createByKey';

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
  data: Data | null;
  error?: Error | null;
}

export interface AnyFetchableState {
  isFetching: boolean;
  data?: any;
  error?: Error | null;
}

export const createReducer = (intialState: any, handlers: ActionHandler) => (
  state = intialState,
  action: AnyAction
) =>
  handlers.hasOwnProperty(action.type)
    ? handlers[action.type](state, action)
    : state;

export const createFetching = ({
  FETCHING,
  FULFILLED,
  FAILED,
}: ActionTypes) => {
  return createReducer(false, {
    [FETCHING]: (state, action) => true,
    [FULFILLED]: () => false,
    [FAILED]: () => false,
  });
};

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
export const createFetchReducer = function(actionTypes: ActionTypes): Reducer {
  return combineReducers({
    isFetching: createFetching(actionTypes),
    data: createResultData(actionTypes, null),
    error: createError(actionTypes),
  });
};

// For collections
export const createFetchListReducer = function(
  actionTypes: ActionTypes
): Reducer {
  return combineReducers({
    isFetching: createFetching(actionTypes),
    data: createResultData(actionTypes, []),
    error: createError(actionTypes),
  });
};
