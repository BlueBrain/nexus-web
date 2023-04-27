import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router';
import { RootState } from 'shared/store/reducers';

type Props = {
  children: React.ReactNode;
};

const PrivateRoute = ({ children, ...rest }: Props) => {
  const oidc = useSelector((state: RootState) => state.oidc);
  const userAuthenticated = oidc && !!oidc.user;
  return (
    <Route
      {...rest}
      render={({ location }) => {
        return userAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        );
      }}
    />
  );
};

export default PrivateRoute;
