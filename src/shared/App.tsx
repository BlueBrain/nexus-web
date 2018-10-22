import React = require('react');
import { Route, Switch } from 'react-router-dom';
import routes from '../shared/routes';
import NotFound from './views/404';
import MainLayout from './layouts/MainLayout';

export default class App extends React.Component {
  render() {
    return (
      <MainLayout>
      <Switch>
        {routes.map(({ path, exact, component: C, ...rest }) => (
          <Route
            key={path}
            path={path}
            exact={exact}
            render={props => (
              // @ts-ignore
              <C {...props} {...rest} />
            )}
          />
        ))}
        <Route render={props => (
          // @ts-ignore
          <NotFound {...props} />
        )} />
      </Switch>
      </MainLayout>
    );
  }
}
