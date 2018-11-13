import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import routes from '../shared/routes';
import NotFound from './views/404';
import Login from './views/Login';
import MainLayout from './layouts/MainLayout';
import BareLayout from './layouts/BareLayout';

import PrivateRoute from './utils/PrivateRoute';
import './App.less';

export default class App extends React.Component {
  render() {
    return (
      <Switch>
        {routes.map(({ path, ...rest }) => (
          <PrivateRoute key={path} path={path} wrapper={MainLayout} {...rest} />
        ))}
        <Route
          path="/login"
          exact={false}
          render={matchProps => (
            <BareLayout>
              <Login />
            </BareLayout>
          )}
        />
        <Route component={NotFound} />
      </Switch>
    );
  }
}
