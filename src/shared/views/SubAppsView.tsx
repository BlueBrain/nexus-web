import { Location } from 'history';
import * as React from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import NotFound from './404';

const SubAppsView: React.FC<{
  routesWithSubApps: any[];
}> = ({ routesWithSubApps }) => {
  const location = useLocation();
  const background =
    location.state && (location.state as { background?: Location }).background;
  return (
    <Switch location={background ? background : location}>
      {routesWithSubApps.map(({ path, component: C, ...rest }) => (
        <Route key={path as string} path={path} component={C} {...rest} />
      ))}
      <Route component={NotFound} />
    </Switch>
  );
};

export default SubAppsView;
