import * as React from 'react';
import { Route, Switch, useLocation, useHistory } from 'react-router-dom';
import routes from '../shared/routes';
import NotFound from './views/404';
import MainLayout from './layouts/MainLayout';

import './App.less';
import { Modal } from 'antd';
import ResourceView from './views/ResourceView';

const App: React.FC = () => {
  let location = useLocation();
  let history = useHistory();

  // This piece of state is set when one of the
  // gallery links is clicked. The `background` state
  // is the location that we were at when one of
  // the gallery links was clicked. If it's there,
  // use it as the location for the <Switch> so
  // we show the gallery in the background, behind
  // the modal.
  let background = location.state && location.state.background;

  console.log({ background });
  return (
    <MainLayout>
      <Switch location={background || location}>
        {routes.map(({ path, component: C, ...rest }) => (
          <Route key={path as string} path={path} component={C} {...rest} />
        ))}
        <Route component={NotFound} />
      </Switch>

      {background && (
        <Switch>
          {routes.map(({ path, component: C, ...rest }) => (
            <Route key={path as string} path={path} {...rest}>
              <Modal
                visible={true}
                onCancel={() => history.push(background, {})}
              >
                <h1>Hello From {path}</h1>
              </Modal>
            </Route>
          ))}
          <Route component={NotFound} />
        </Switch>
      )}
    </MainLayout>
  );
};

export default App;
