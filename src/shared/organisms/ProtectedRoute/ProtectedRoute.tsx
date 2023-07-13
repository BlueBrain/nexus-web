import React from 'react';
import { Redirect, Route } from 'react-router';
import useUserAuthenticated from '../../hooks/useUserAuthenticated';

type Props = {
  children: React.ReactNode;
};

const PrivateRoute = ({ children, ...rest }: Props) => {
  const userAuthenticated = useUserAuthenticated();
  return (
    <Route
      {...rest}
      render={props => {
        return Boolean(userAuthenticated) ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: `/login`,
              state: {
                from: props.location.pathname,
                searchQuery: props.location.search,
              },
            }}
          />
        );
      }}
    />
  );
};

export default PrivateRoute;
