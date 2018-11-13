import * as React from 'react';
import { Route, RouteProps, Redirect } from 'react-router-dom';

import AuthContext from '../context/AuthContext';

export interface PrivateRouteProps extends RouteProps {
  wrapper?: React.ComponentType;
}

const PrivateRoute: React.SFC<PrivateRouteProps> = ({
  path,
  component: C,
  wrapper: W,
  ...rest
}) => (
  // @ts-ignore
  <AuthContext.Consumer>
    {({ authenticated }) => (
      <Route
        {...rest}
        path={path}
        render={props =>
          // TODO, implement isAuthenticated function
          authenticated ? (
            // @ts-ignore
            <C {...props} />
          ) : (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: props.location },
              }}
            />
          )
        }
      />
    )}
  </AuthContext.Consumer>
);

export default PrivateRoute;
