import { AuthActions, AuthActionTypes } from '../actions/auth';
import { Identity } from '@bbp/nexus-sdk-legacy/lib/ACL/types';
import { createFetchReducer, FetchableState } from './utils';
import { IdentityList, PaginatedList, ACL, Realm } from '@bbp/nexus-sdk';

export interface AuthState {
  identities?: FetchableState<IdentityList>;
  acls?: FetchableState<PaginatedList<ACL>>;
  realms?: FetchableState<PaginatedList<Realm>>;
}

const initialState: AuthState = {};

const identityReducer = createFetchReducer(
  {
    FETCHING: AuthActionTypes.IDENTITY_FETCHING,
    FULFILLED: AuthActionTypes.IDENTITY_FULFILLED,
    FAILED: AuthActionTypes.IDENTITY_FAILED,
  },
  []
);
const realmReducer = createFetchReducer(
  {
    FETCHING: AuthActionTypes.REALM_FETCHING,
    FULFILLED: AuthActionTypes.REALM_FULFILLED,
    FAILED: AuthActionTypes.REALM_FAILED,
  },
  []
);

function authReducer(
  state: AuthState = initialState,
  action: AuthActions
): AuthState {
  if (action.type.startsWith('@@nexus/AUTH_IDENTITY_')) {
    return {
      ...state,
      identities: identityReducer(state.identities, action),
    };
  }
  if (action.type.startsWith('@@nexus/AUTH_REALM_')) {
    return {
      ...state,
      realms: realmReducer(state.realms, action),
    };
  }
  return state;
}

export default authReducer;
