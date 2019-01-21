import { Action } from 'redux';

export interface FetchAction<T> extends Action<T> {
  type: T;
}

export interface FetchFulfilledAction<T, DATA> extends FetchAction<T> {
  payload: DATA;
}

export interface FetchFailedAction<A> extends FetchAction<A> {
  error: Error;
}

// Filter Actions are used to switch by Key inside reducers
export interface FilterAction<T> extends Action<T> {
  filterKey: string;
}

export interface PayloadAction<T, DATA> extends Action<T> {
  payload: DATA;
}

export interface FilterPayloadAction<T, DATA> extends FilterAction<T> {
  payload: DATA;
}
