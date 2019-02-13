import { Action, ActionCreator, Dispatch } from 'redux';
import { FetchAction, FetchFulfilledAction, FetchFailedAction } from './utils';
import { PaginatedList, ACL } from '@bbp/nexus-sdk';
import { ListACLOptions, Identity } from '@bbp/nexus-sdk/lib/ACL/types';

export enum AuthActionTypes {
  ACL_FETCHING = '@@nexus/AUTH_ACL_FETCHING',
  ACL_FULFILLED = '@@nexus/AUTH_ACL_FULFILLED',
  ACL_FAILED = '@@nexus/AUTH_ACL_FAILED',
  IDENTITY_FETCHING = '@@nexus/AUTH_IDENTITY_FETCHING',
  IDENTITY_FULFILLED = '@@nexus/AUTH_IDENTITY_FULFILLED',
  IDENTITY_FAILED = '@@nexus/AUTH_IDENTITY_FAILED',
}

/**
 * ACLs
 */
type FetchAclsAction = FetchAction<AuthActionTypes.ACL_FETCHING>;
const fetchAclsAction: ActionCreator<FetchAclsAction> = () => ({
  type: AuthActionTypes.ACL_FETCHING,
});

type FetchAclsFulfilledAction = FetchFulfilledAction<
  AuthActionTypes.ACL_FULFILLED,
  PaginatedList<ACL>
>;
const fetchAclsFulfilledAction: ActionCreator<FetchAclsFulfilledAction> = (
  acls: PaginatedList<ACL>
) => ({
  type: AuthActionTypes.ACL_FULFILLED,
  payload: acls,
});

type FetchAclsFailedAction = FetchFailedAction<AuthActionTypes.ACL_FAILED>;
const fetchAclsFailedAction: ActionCreator<
  FetchFailedAction<AuthActionTypes.ACL_FAILED>
> = (error: Error) => ({
  error,
  type: AuthActionTypes.ACL_FAILED,
});

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
 * Export ALL types
 */
export type AuthActions =
  | SetAuthenticatedAction
  | FetchAclsAction
  | FetchAclsFulfilledAction
  | FetchAclsFailedAction
  | FetchIdentitiesAction
  | FetchIdentitiesFulfilledAction
  | FetchIdentitiesFailedAction;

/**
 *  Actual Actions
 */

function fetchAcls(path: string, aclOptions?: ListACLOptions) {
  return async (
    dispatch: Dispatch<any>
  ): Promise<FetchAclsFulfilledAction | FetchAclsFailedAction> => {
    dispatch(fetchAclsAction);
    try {
      const paginatedAcls = await ACL.list(path, aclOptions);
      return dispatch(fetchAclsFulfilledAction(paginatedAcls));
    } catch (error) {
      return dispatch(fetchAclsFailedAction());
    }
  };
}

function fetchIdentities() {
  return async (
    dispatch: Dispatch<any>
  ): Promise<FetchIdentitiesFulfilledAction | FetchIdentitiesFailedAction> => {
    dispatch(fetchIdentitiesAction);
    try {
      const identities: Identity[] = await ACL.listIdentities();
      return dispatch(fetchIdentitiesFulfilledAction(identities));
    } catch (error) {
      return dispatch(fetchIdentitiesFailedAction());
    }
  };
}

const setAuthenticated = (
  isAuthenticated: boolean
): SetAuthenticatedAction => ({
  type: 'SET_AUTHENTICATED',
  payload: isAuthenticated,
});

export default {
  setAuthenticated,
  fetchAcls,
  fetchIdentities,
};
