import * as React from 'react';
import { Route, Switch, useLocation, useHistory } from 'react-router-dom';
import routes from '../shared/routes';
import NotFound from './views/404';
import MainLayout from './layouts/MainLayout';

import './App.less';
import { Modal } from 'antd';
import ResourceViewContainer from './containers/ResourceViewContainer';

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
  const background = location.state && location.state.background;

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
        // that are placed inside a model
        // when they background state is provided
      }
      {background && (
        <Route
          path={'/:orgLabel/:projectLabel/resources/:resourceId'}
          render={routeProps => (
            <Modal
              visible={true}
              onCancel={() => history.push(background, {})}
              onOk={() => history.push(location.pathname, {})}
              okText={'View Details'}
            >
              <ResourceViewContainer />
            </Modal>
          )}
        />
      )}
    </MainLayout>
  );
};

export default App;
