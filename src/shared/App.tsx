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
      <MainLayout>
        <Switch>
<<<<<<< HEAD
          {routes.map(({ path, ...rest }) => (
            <PrivateRoute key={path} path={path} {...rest} />
=======
          {routes.map(({ path, component: C, ...rest }) => (
            <Route key={path} path={path} component={C} {...rest} />
>>>>>>> login action in header
          ))}
          <Route component={NotFound} />
        </Switch>
      </MainLayout>
    );
  }
}
