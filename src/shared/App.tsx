import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import GalleryView from './views/GalleryView';
import routes from '../shared/routes';
import NotFound from './views/404';
import FusionMainLayout, { SubAppProps } from './layouts/FusionMainLayout';
import SubApps, { SubAppObject, SubApp } from '../subapps/index';
import './App.less';

const App: React.FC = () => {
  // Invoke SubApps
  // TODO: maybe it's better to invoke them elsewhere
  const subApps = Array.from(SubApps.values()).reduce(
    (memo: Map<string, SubAppObject>, subApp: SubApp) => {
      const app = subApp();
      memo.set(app.namespace, app);
      return memo;
    },
    new Map()
  );

  const subAppRoutes = Array.from(subApps.values())
    .map((subApp: SubAppObject) => {
      return subApp.routes.map((route: any) => {
        route.path = `/${subApp.namespace}${route.path}`;
        return route;
      });
    })
    .reduce((acc, val) => {
      return [...acc, ...val];
    }, []);

  // Apply Subapp routes
  const routesWithSubApps = [...routes, ...subAppRoutes];

  return (
    <>
      <FusionMainLayout
        subApps={Array.from(subApps.values()).map(subApp => ({
          label: subApp.title,
          key: subApp.title,
          route: `/${subApp.namespace}`,
          icon: subApp.icon,
        }))}
      >
        <Switch>
          {routesWithSubApps.map(({ path, component: C, ...rest }) => (
            <Route key={path as string} path={path} component={C} {...rest} />
          ))}
          <Route component={NotFound} />
        </Switch>
        <GalleryView />
      </FusionMainLayout>
    </>
  );
};

export default App;
