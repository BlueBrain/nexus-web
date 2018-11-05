import * as React from 'react';
import { Route, RouteProps, Redirect } from 'react-router-dom';

const PrivateRoute: React.SFC<RouteProps> = ({ component: C, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      // TODO, implement isAuthenticated function
      true ? (
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
);

export default PrivateRoute;
