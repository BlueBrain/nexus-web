import React from 'react';
import { useSelector } from 'react-redux';
import { Redirect, Route } from 'react-router';
import { RootState } from 'shared/store/reducers';

type Props = {
  children: React.ReactNode;
};

const PrivateRoute = ({ children, ...rest }: Props) => {
  const oidc = useSelector((state: RootState) => state.oidc);
  let userAuthenticated = oidc && !!oidc.user?.id_token;
  console.log('@@oidc', JSON.stringify(oidc, null, 2));
  console.log('@@route', JSON.stringify(rest, null, 2));
  if (window.Cypress) {
    userAuthenticated = Boolean(localStorage.getItem('nexus__token'));
    console.log('@@cypress', userAuthenticated);
  }
  return (
    <Route
      {...rest}
      render={props => {
        return Boolean(userAuthenticated) ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location },
            }}
          />
        );
      }}
    />
  );
};

export default PrivateRoute;
