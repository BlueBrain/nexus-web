import { Location } from 'history';
import { Redirect, Route, Switch, useLocation } from 'react-router-dom';

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
        ({ path, component: SubAppComponent, requireLogin, ...rest }) => {
          return (
            <Route key={`path-${path as string}`} path={path} {...rest}>
              <SubAppComponent />
            </Route>
          );
        }
      )}
      <Redirect
        from="/admin/:orgLabel/:projectLabel/browse"
        to="/orgs/:orgLabel/:projectLabel/browse"
      />
      <Redirect
        from="/admin/:orgLabel/:projectLabel/query/:viewId?"
        to="/orgs/:orgLabel/:projectLabel/query/:viewId?"
      />
      <Redirect
        from="/admin/:orgLabel/:projectLabel/create"
        to="/orgs/:orgLabel/:projectLabel/create"
      />
      <Redirect
        from="/admin/:orgLabel/:projectLabel/statistics"
        to="/orgs/:orgLabel/:projectLabel/statistics"
      />
      <Redirect
        from="/admin/:orgLabel/:projectLabel/settings"
        to="/orgs/:orgLabel/:projectLabel/settings"
      />
      <Redirect
        from="/admin/:orgLabel/:projectLabel/graph-analytics"
        to="/orgs/:orgLabel/:projectLabel/graph-analytics"
      />
      <Redirect
        from="/admin/:orgLabel/:projectLabel/jira"
        to="/orgs/:orgLabel/:projectLabel/jira"
      />
      <Redirect
        from="/admin/:orgLabel/:projectLabel"
        to="/orgs/:orgLabel/:projectLabel"
      />
      <Redirect from="/admin/:orgLabel" to="/orgs/:orgLabel" />
      <Redirect from="/admin" to="/orgs" />
      <Route component={NotFound} />
    </Switch>
  );
};

export default SubAppsView;
