import { Action, ActionCreator, Dispatch } from 'redux';
import { PaginatedList, Realm, IdentityList } from '@bbp/nexus-sdk';
import { RootState } from '../reducers';
import { ThunkAction } from '..';
import { FetchAction, FetchFulfilledAction, FetchFailedAction } from './utils';
export declare enum AuthActionTypes {
  IDENTITY_FETCHING = '@@nexus/AUTH_IDENTITY_FETCHING',
  IDENTITY_FULFILLED = '@@nexus/AUTH_IDENTITY_FULFILLED',
  IDENTITY_FAILED = '@@nexus/AUTH_IDENTITY_FAILED',
  REALM_FETCHING = '@@nexus/AUTH_REALM_FETCHING',
  REALM_FULFILLED = '@@nexus/AUTH_REALM_FULFILLED',
  REALM_FAILED = '@@nexus/AUTH_REALM_FAILED',
  LOGIN_FAILED = '@@nexus/LOGIN_FAILED',
}
/**
 * Identity
 */
declare type FetchIdentitiesAction = FetchAction<
  AuthActionTypes.IDENTITY_FETCHING
>;
declare type FetchIdentitiesFulfilledAction = FetchFulfilledAction<
  AuthActionTypes.IDENTITY_FULFILLED,
  IdentityList
>;
declare type FetchIdentitiesFailedAction = FetchFailedAction<
  AuthActionTypes.IDENTITY_FAILED
>;
/**
 * Auth
 */
interface SetAuthenticatedAction extends Action {
  type: 'SET_AUTHENTICATED';
  payload: boolean;
}
/**
 * Realms
 */
declare type FetchRealmsAction = FetchAction<AuthActionTypes.REALM_FETCHING>;
declare type FetchRealmsFulfilledAction = FetchFulfilledAction<
  AuthActionTypes.REALM_FULFILLED,
  PaginatedList<Realm>
>;
declare type FetchRealmsFailedAction = FetchFailedAction<
  AuthActionTypes.REALM_FAILED
>;
export declare type AuthFailedAction = FetchFailedAction<
  AuthActionTypes.LOGIN_FAILED
>;
/**
 * Export ALL types
 */
export declare type AuthActions =
  | SetAuthenticatedAction
  | FetchIdentitiesAction
  | FetchIdentitiesFulfilledAction
  | FetchIdentitiesFailedAction
  | FetchRealmsAction
  | FetchRealmsFulfilledAction
  | FetchRealmsFailedAction
  | AuthFailedAction;
/**
 *  Actual Actions
 */
declare const fetchIdentities: ActionCreator<ThunkAction>;
declare const fetchRealms: ActionCreator<ThunkAction>;
declare function performLogin(): (
  dispatch: Dispatch<any>,
  getState: () => RootState
) => Promise<any>;
export { fetchIdentities, fetchRealms, performLogin };
