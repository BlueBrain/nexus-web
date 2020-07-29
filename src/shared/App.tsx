import { Modal, message } from 'antd';
import * as React from 'react';
import {
  Route,
  Switch,
  useLocation,
  useHistory,
  RouteProps,
  Redirect,
} from 'react-router-dom';
import { Location } from 'history';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';

import routes from '../shared/routes';
import NotFound from './views/404';
import FusionMainLayout, { SubAppProps } from './layouts/FusionMainLayout';
import ResourceViewContainer from './containers/ResourceViewContainer';
import { parseProjectUrl } from './utils';
import SubApps, { SubAppObject, SubApp } from '../subapps/index';

import './App.less';

const getUrlParameter = (name: string) => {
  const filteredName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${filteredName}=([^&#]*)`);
  const results = regex.exec(window.location.search);
  return results === null ? '' : results[1].replace(/\+/g, ' ');
};

const App: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const nexus = useNexusContext();

  // The following provides the logic
  // To search for a self url using
  // a query param from any app path
  const self = getUrlParameter('_self');
  if (self && self !== '') {
    nexus
      .httpGet({
        path: self,
        headers: { Accept: 'application/json' },
      })
      .then((resource: Resource) => {
        const [orgLabel, projectLabel] = parseProjectUrl(resource._project);
        // We use history.replace here
        // to replace the /?_self history
        // with our resolved resource
        // otherwise if we hit the back button
        // we would never be able to go back to
        // whatever url was before the /?_self query
        history.replace(
          `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
            resource['@id']
          )}`,
          location.state || {}
        );
      })
      .catch(error => {
        message.error(`Resource ${self} could not be found`);
      });
  }

  // This piece of state is set when one of the
  // gallery links is clicked. The `background` state
  // is the location that we were at when one of
  // the gallery links was clicked. If it's there,
  // use it as the location for the <Switch> so
  // we show the gallery in the background, behind
  // the modal.
  const background =
    location.state && (location.state as { background?: Location }).background;

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
    <FusionMainLayout
      subApps={Array.from(subApps.values()).map(subApp => ({
        label: subApp.title,
        key: subApp.title,
        route: `/${subApp.namespace}`,
        icon: subApp.icon,
      }))}
    >
      <Switch location={background || location}>
        {routesWithSubApps.map(({ path, component: C, ...rest }) => (
          <Route key={path as string} path={path} component={C} {...rest} />
        ))}
        <Route component={NotFound} />
      </Switch>

      {
        // This is where special routes should go
        // that are placed inside a modal
        // when the background state is provided
      }
      {background && [
        <Route
          key="resource-modal"
          path={'/:orgLabel/:projectLabel/resources/:resourceId'}
          render={routeProps => (
            <Modal
              visible={true}
              footer={null}
              onCancel={() => history.push(background.pathname, {})}
              className="modal-view"
              width="inherit"
            >
              <ResourceViewContainer />
            </Modal>
          )}
        />,
      ]}
    </FusionMainLayout>
  );
};

export default App;
