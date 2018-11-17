import * as React from 'react';
import { connect } from 'react-redux';
import { Route, RouteProps, Redirect } from 'react-router-dom';

import AuthContext from '../context/AuthContext';
import { AuthState } from '../store/reducers/auth';

export interface PrivateRouteProps extends RouteProps {
  authenticated: boolean;
}

const PrivateRoute: React.SFC<PrivateRouteProps> = ({
  path,
  component: C,
  authenticated,
  ...rest
}) => (
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
);

const mapStateToProps = ({ auth }: { auth: AuthState }) => ({
  authenticated: auth.authenticated,
});

export default connect(mapStateToProps)(PrivateRoute);
