import { AuthActions, AuthActionTypes } from '../actions/auth';
import { Identity } from '@bbp/nexus-sdk-legacy/lib/ACL/types';
import { createFetchReducer, FetchableState } from './utils';
import { PaginatedList, ACL, Realm } from '@bbp/nexus-sdk-legacy';

export interface AuthState {
  identities?: FetchableState<Identity[]>;
  acls?: FetchableState<PaginatedList<ACL>>;
  realms?: FetchableState<PaginatedList<Realm>>;
}

const initialState: AuthState = {};

const aclsReducer = createFetchReducer({
  FETCHING: AuthActionTypes.ACL_FETCHING,
  FULFILLED: AuthActionTypes.ACL_FULFILLED,
  FAILED: AuthActionTypes.ACL_FAILED,
});
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
  // if (action.type === 'SET_AUTHENTICATED') {
  //   return { ...state, authenticated: action.payload };
  // }
  if (action.type.startsWith('@@nexus/AUTH_ACL_')) {
    return {
      ...state,
      acls: aclsReducer(state.acls, action),
    };
  }
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
