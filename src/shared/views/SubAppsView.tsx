import { Location } from 'history';
import * as React from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import PrivateRoute from '../../shared/organisms/ProtectedRoute/ProtectedRoute';
import NotFound from './404';

const SubAppsView: React.FC<{
  routesWithSubApps: any[];
}> = ({ routesWithSubApps }) => {
  const location = useLocation();

  const background =
    location.state && (location.state as { background?: Location }).background;

  return (
    // @ts-ignore
    <Switch location={background || location}>
      {routesWithSubApps.map(
        ({ path, component: SubAppComponent, requireLogin, ...rest }) =>
          rest.protected ? (
            <PrivateRoute
              path={path}
              {...rest}
              key={`protected-${path as string}`}
            >
              <SubAppComponent />
            </PrivateRoute>
          ) : (
            <Route key={`public-${path as string}`} path={path} {...rest}>
              <SubAppComponent />
            </Route>
          )
      )}
      <Route component={NotFound} />
    </Switch>
  );
};

export default SubAppsView;
