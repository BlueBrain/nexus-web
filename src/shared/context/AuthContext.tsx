import * as React from 'react';

export interface AuthContextState {
  authenticated: boolean;
  accessToken?: string;
  authorizationEndpoint?: string;
  endSessionEndpoint?: string;
  redirectHostName?: string;
}

const initialState: AuthContextState = {
  authenticated: false,
};

const AuthContext: React.Context<AuthContextState> = React.createContext(
  initialState
);

export default AuthContext;
