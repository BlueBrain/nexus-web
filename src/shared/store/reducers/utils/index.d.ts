import { AnyAction, Reducer } from 'redux';
import { RequestError } from '../../actions/utils/errors';
export declare type ActionReducer = (state: any, action: AnyAction) => any;
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
export declare const createReducer: (
  intialState: any,
  handlers: ActionHandler
) => (state: any, action: AnyAction) => any;
export declare const createFetching: ({
  FAILED,
  FETCHING,
  FULFILLED,
}: ActionTypes) => (state: any, action: AnyAction) => any;
export declare const createResultData: (
  { FAILED, FETCHING, FULFILLED }: ActionTypes,
  initialState: [] | null
) => (state: any, action: AnyAction) => any;
export declare const createError: ({
  FAILED,
  FETCHING,
  FULFILLED,
}: ActionTypes) => (state: any, action: AnyAction) => any;
export declare const createFetchReducer: (
  actionTypes: ActionTypes,
  initialData?: any
) => Reducer;
