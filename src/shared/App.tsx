import * as React from 'react';
import { Route, Switch, useLocation, useHistory } from 'react-router-dom';
import routes from '../shared/routes';
import NotFound from './views/404';
import MainLayout from './layouts/MainLayout';

import './App.less';
import { Modal } from 'antd';
import ResourceViewContainer from './containers/ResourceViewContainer';
import StudioResourceView from './views/StudioResourceView';
import { Location } from 'history';

const App: React.FC = () => {
  const location = useLocation();
  const history = useHistory();

  // This piece of state is set when one of the
  // gallery links is clicked. The `background` state
  // is the location that we were at when one of
  // the gallery links was clicked. If it's there,
  // use it as the location for the <Switch> so
  // we show the gallery in the background, behind
  // the modal.
  const background =
    location.state && (location.state as { background?: Location }).background;

  return (
    <MainLayout>
      <Switch location={background || location}>
        {routes.map(({ path, component: C, ...rest }) => (
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
              onCancel={() => history.push(background.pathname, {})}
              onOk={() => history.push(location.pathname, {})}
              okText="Graph View"
              className="modal-view"
              width="inherit"
            >
              <ResourceViewContainer />
            </Modal>
          )}
        />,
        <Route
          key="studio-resource-modal"
          path={'/studios/studio-resources/:resourceSelfUri'}
          render={routeProps => (
            <Modal
              visible={true}
              onCancel={() => history.push(background.pathname, {})}
              footer={null}
              className="modal-view-unconstrained"
              width="inherit"
            >
              <StudioResourceView />
            </Modal>
          )}
        />,
      ]}
    </MainLayout>
  );
};

export default App;
