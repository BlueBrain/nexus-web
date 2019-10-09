import { Action, ActionCreator, Dispatch } from 'redux';
import { FetchAction, FetchFulfilledAction, FetchFailedAction } from './utils';
import { PaginatedList, ACL, Realm } from '@bbp/nexus-sdk-legacy';
import { Identity } from '@bbp/nexus-sdk-legacy/lib/ACL/types';
import { ThunkAction } from '..';

export enum AuthActionTypes {
  IDENTITY_FETCHING = '@@nexus/AUTH_IDENTITY_FETCHING',
  IDENTITY_FULFILLED = '@@nexus/AUTH_IDENTITY_FULFILLED',
  IDENTITY_FAILED = '@@nexus/AUTH_IDENTITY_FAILED',
  REALM_FETCHING = '@@nexus/AUTH_REALM_FETCHING',
  REALM_FULFILLED = '@@nexus/AUTH_REALM_FULFILLED',
  REALM_FAILED = '@@nexus/AUTH_REALM_FAILED',
}

/**
 * Identity
 */
type FetchIdentitiesAction = FetchAction<AuthActionTypes.IDENTITY_FETCHING>;
const fetchIdentitiesAction: ActionCreator<FetchIdentitiesAction> = () => ({
  type: AuthActionTypes.IDENTITY_FETCHING,
});

type FetchIdentitiesFulfilledAction = FetchFulfilledAction<
  AuthActionTypes.IDENTITY_FULFILLED,
  Identity[]
>;
const fetchIdentitiesFulfilledAction: ActionCreator<
  FetchIdentitiesFulfilledAction
> = (identities: Identity[]) => ({
  type: AuthActionTypes.IDENTITY_FULFILLED,
  payload: identities,
});

type FetchIdentitiesFailedAction = FetchFailedAction<
  AuthActionTypes.IDENTITY_FAILED
>;
const fetchIdentitiesFailedAction: ActionCreator<
  FetchFailedAction<AuthActionTypes.IDENTITY_FAILED>
> = (error: Error) => ({
  error,
  type: AuthActionTypes.IDENTITY_FAILED,
});

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
type FetchRealmsAction = FetchAction<AuthActionTypes.REALM_FETCHING>;
const fetchRealmsAction: ActionCreator<FetchRealmsAction> = () => ({
  type: AuthActionTypes.REALM_FETCHING,
});

type FetchRealmsFulfilledAction = FetchFulfilledAction<
  AuthActionTypes.REALM_FULFILLED,
  PaginatedList<Realm>
>;
const fetchRealmsFulfilledAction: ActionCreator<FetchRealmsFulfilledAction> = (
  realms: PaginatedList<Realm>
) => ({
  type: AuthActionTypes.REALM_FULFILLED,
  payload: realms,
});

type FetchRealmsFailedAction = FetchFailedAction<AuthActionTypes.REALM_FAILED>;
const fetchRealmsFailedAction: ActionCreator<
  FetchFailedAction<AuthActionTypes.REALM_FAILED>
> = (error: Error) => ({
  error,
  type: AuthActionTypes.REALM_FAILED,
});

/**
 * Export ALL types
 */
export type AuthActions =
  | SetAuthenticatedAction
  | FetchIdentitiesAction
  | FetchIdentitiesFulfilledAction
  | FetchIdentitiesFailedAction
  | FetchRealmsAction
  | FetchRealmsFulfilledAction
  | FetchRealmsFailedAction;

/**
 *  Actual Actions
 */

function fetchIdentities() {
  return async (
    dispatch: Dispatch<any>
  ): Promise<FetchIdentitiesFulfilledAction | FetchIdentitiesFailedAction> => {
    dispatch(fetchIdentitiesAction);
    try {
      const identities: Identity[] = await ACL.listIdentities();
      return dispatch(fetchIdentitiesFulfilledAction(identities));
    } catch (error) {
      return dispatch(fetchIdentitiesFailedAction(error));
    }
  };
}

const fetchRealms: ActionCreator<ThunkAction> = () => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexusLegacy }
  ): Promise<FetchRealmsFulfilledAction | FetchRealmsFailedAction> => {
    const Realm = nexusLegacy.Realm;
    dispatch(fetchIdentitiesAction);
    try {
      const data: PaginatedList<Realm> = await Realm.list();
      return dispatch(fetchRealmsFulfilledAction(data));
    } catch (error) {
      return dispatch(fetchRealmsFailedAction(error));
    }
  };
};

export { fetchIdentities, fetchRealms };
