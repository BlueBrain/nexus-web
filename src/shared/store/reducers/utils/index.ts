import { Action, AnyAction, combineReducers, Reducer } from 'redux';

import { RequestError } from '../../actions/utils/errors';

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
  error?: RequestError | null;
}

export interface AnyFetchableState {
  isFetching: boolean;
  data?: any;
  error?: RequestError | null;
}

export const createReducer = (intialState: any, handlers: ActionHandler) => (
  state = intialState,
  action: AnyAction
) =>
  handlers.hasOwnProperty(action.type)
    ? handlers[action.type](state, action)
    : state;

export const createFetching = ({
  FAILED,
  FETCHING,
  FULFILLED,
}: ActionTypes) => {
  return createReducer(false, {
    [FAILED]: () => false,
    [FETCHING]: () => true,
    [FULFILLED]: () => false,
  });
};

export const createResultData = (
  { FAILED, FETCHING, FULFILLED }: ActionTypes,
  initialState: [] | null
) =>
  createReducer(initialState, {
    [FAILED]: (state, action) => initialState,
    [FETCHING]: (state, action) => initialState,
    [FULFILLED]: (state, action) => action.payload,
  });

export const createError = ({ FAILED, FETCHING, FULFILLED }: ActionTypes) =>
  createReducer(null, {
    [FAILED]: (state, action) => action.error,
    [FETCHING]: (state, action) => null,
    [FULFILLED]: (state, action) => null,
  });

export const createFetchReducer = function(
  actionTypes: ActionTypes,
  initialData?: any
): Reducer {
  return combineReducers({
    isFetching: createFetching(actionTypes),
    data: createResultData(actionTypes, initialData || null),
    error: createError(actionTypes),
  });
};
