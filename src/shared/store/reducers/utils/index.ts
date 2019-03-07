import { combineReducers, AnyAction, Reducer, Action } from 'redux';
import { RequestError } from '../../actions/utils/errors';

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
  FETCHING,
  FULFILLED,
  FAILED,
}: ActionTypes) => {
  return createReducer(false, {
    [FETCHING]: () => true,
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

export const createError = ({ FAILED, FULFILLED }: ActionTypes) =>
  createReducer(null, {
    [FAILED]: (state, action) => action.error,
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
