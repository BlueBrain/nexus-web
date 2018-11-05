import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import routes from '../shared/routes';
import NotFound from './views/404';
import Login from './views/Login';
import MainLayout from './layouts/MainLayout';

import PrivateRoute from './utils/PrivateRoute';
import './App.less';

export default class App extends React.Component {
  render() {
    return (
      <MainLayout>
      <Switch>
        {routes.map(({ path, exact, component: C, ...rest }) => (
          <Route
            {...rest}
            key={path}
            path={path}
            exact={exact}
            render={props => (
              // @ts-ignore
              <C {...props} {...rest} />
            )}
          />
        ))}
        <Route
          path="/login"
          exact={false}
          component={Login}
        />
        <Route
          component={NotFound}
        />
      </Switch>
      </MainLayout>
    );
  }
}
