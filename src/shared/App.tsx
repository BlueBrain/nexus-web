import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import routes from '../shared/routes';
import NotFound from './views/404';
import MainLayout from './layouts/MainLayout';

import './App.less';

export default class App extends React.Component {
  render() {
    return (
      <MainLayout>
        <Switch>
          {routes.map(({ path, component: C, ...rest }) => (
            <Route key={path} path={path} component={C} {...rest} />
          ))}
          <Route component={NotFound} />
        </Switch>
      </MainLayout>
    );
  }
}
