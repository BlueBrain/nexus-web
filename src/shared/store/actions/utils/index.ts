import { Action } from 'redux';

export interface FetchAction<A> extends Action {
  type: A;
}

export interface FetchFulfilledAciton<A, P> extends FetchAction<A> {
  payload: P;
}

export interface FetchFailedAction<A> extends FetchAction<A> {
  error: Error;
}
