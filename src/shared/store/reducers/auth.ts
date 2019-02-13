import { AuthActions, AuthActionTypes } from '../actions/auth';
import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';
import { createFetchReducer } from './utils';
import { PaginatedList, ACL } from '@bbp/nexus-sdk';

export interface AuthState {
  authenticated: boolean;
  identities?: Identity[];
  acls?: PaginatedList<ACL>;
  tokenData?: object;
  clientId?: string;
  accessToken?: string;
  authorizationEndpoint?: string;
  endSessionEndpoint?: string;
  redirectHostName?: string;
}

const initialState: AuthState = {
  authenticated: false,
};

const aclsReducer = createFetchReducer({
  FETCHING: AuthActionTypes.ACL_FETCHING,
  FULFILLED: AuthActionTypes.ACL_FULFILLED,
  FAILED: AuthActionTypes.ACL_FAILED,
});
const identityReducer = createFetchReducer({
  FETCHING: AuthActionTypes.IDENTITY_FETCHING,
  FULFILLED: AuthActionTypes.IDENTITY_FULFILLED,
  FAILED: AuthActionTypes.IDENTITY_FAILED,
});

function authReducer(
  state: AuthState = initialState,
  action: AuthActions
): AuthState {
  if (action.type === 'SET_AUTHENTICATED') {
    return { ...state, authenticated: action.payload };
  }
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
  return state;
}

export default authReducer;
