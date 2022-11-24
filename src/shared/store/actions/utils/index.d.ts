import { Action } from 'redux';
export interface FetchAction<T> extends Action<T> {
  type: T;
}
export interface FetchActionWithKey<T> extends Action<T> {
  type: T;
  key: string;
}
export interface FetchFulfilledAction<T, DATA> extends FetchAction<T> {
  payload: DATA;
}
export interface FetchFulfilledActionWithKey<T, DATA>
  extends FetchActionWithKey<T> {
  payload: DATA;
}
export interface FetchFailedAction<A> extends FetchAction<A> {
  error: Error;
}
export interface FetchFailedActionWithKey<A> extends FetchActionWithKey<A> {
  error: Error;
}
export interface FilterAction<T> extends Action<T> {
  filterKey: string;
}
export interface PayloadAction<T, DATA> extends Action<T> {
  payload: DATA;
}
export interface FilterPayloadAction<T, DATA> extends FilterAction<T> {
  payload: DATA;
}
