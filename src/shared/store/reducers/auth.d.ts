import { AuthActions, AuthFailedAction } from '../actions/auth';
import { FetchableState } from './utils';
import { IdentityList, PaginatedList, ACL, Realm } from '@bbp/nexus-sdk';
export interface AuthState {
  identities?: FetchableState<IdentityList>;
  acls?: FetchableState<PaginatedList<ACL>>;
  realms?: FetchableState<PaginatedList<Realm>>;
  loginError?: {
    error: Error;
  };
}
declare function authReducer(
  state: AuthState | undefined,
  action: AuthActions | AuthFailedAction
): AuthState;
export default authReducer;
