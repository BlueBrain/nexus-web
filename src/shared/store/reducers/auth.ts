import { AuthActions } from '../actions/auth';

export interface AuthState {
  authenticated: boolean;
  clientId?: string;
  accessToken?: string;
  authorizationEndpoint?: string;
  endSessionEndpoint?: string;
  redirectHostName?: string;
}

const initialState: AuthState = {
  authenticated: false,
};

function authReducer(
  state: AuthState = initialState,
  action: AuthActions
): AuthState {
  switch (action.type) {
    case 'SET_AUTHENTICATED':
      return { ...state, authenticated: action.payload };
    default:
      return state;
  }
}

export default authReducer;
