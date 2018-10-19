import React = require('react');
import { Route, Switch } from 'react-router-dom';
import routes from '../shared/routes';
import NotFound from './views/NotFound';

export default class App extends React.PureComponent {
  render() {
    return (
      <Switch>
        {routes.map(({ path, exact, component: C, ...rest }) => (
          <Route
            key={path}
            path={path}
            exact={exact}
            render={(props) => (
              // @ts-ignore
              <C {...props} {...rest} />
            )}
          />
        ))}
        <Route render={(props) => (
          // @ts-ignore
          <NotFound {...props} />
        )} />
      </Switch>
    );
  }
}