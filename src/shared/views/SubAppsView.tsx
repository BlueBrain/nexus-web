import { Location } from 'history';
import { useSelector } from 'react-redux';
import * as React from 'react';
import { Route, Switch, useLocation, Redirect } from 'react-router-dom';
import NotFound from './404';

import { RootState } from '../store/reducers';

const SubAppsView: React.FC<{
  routesWithSubApps: any[];
}> = ({ routesWithSubApps }) => {
  const userLoggedIn = useSelector(
    ({ oidc }: RootState) => oidc && oidc.user !== undefined
  );
  const location = useLocation();
  const background =
    location.state && (location.state as { background?: Location }).background;

  return (
    <Switch location={background ? background : location}>
      {routesWithSubApps.map(
        ({ path, component: SubAppComponent, requireLogin, ...rest }) => (
          <Route key={path as string} path={path} {...rest}>
            {requireLogin && !userLoggedIn ? (
              <Redirect to="/login" />
            ) : (
              <SubAppComponent />
            )}
          </Route>
        )
      )}
      <Route component={NotFound} />
    </Switch>
  );
};

export default SubAppsView;
