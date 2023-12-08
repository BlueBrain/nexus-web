import { ACL, IdentityList, PaginatedList, Realm } from '@bbp/nexus-sdk/es';

import { AuthActions, AuthActionTypes, AuthFailedAction } from '../actions/auth';
import { createFetchReducer, FetchableState } from './utils';

export interface AuthState {
  identities?: FetchableState<IdentityList>;
  acls?: FetchableState<PaginatedList<ACL>>;
  realms?: FetchableState<PaginatedList<Realm>>;
  loginError?: {
    error: Error;
  };
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
  action: AuthActions | AuthFailedAction
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
  if (action.type.startsWith('@@nexus/LOGIN_FAILED')) {
    const authFailedAction = action as AuthFailedAction;

    return {
      ...state,
      loginError: {
        error: authFailedAction.error,
      },
    };
  }
  return state;
}

export default authReducer;
