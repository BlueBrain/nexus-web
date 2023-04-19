import * as React from 'react';

import GalleryView from './views/GalleryView';
import routes from '../shared/routes';
import FusionMainLayout from './layouts/FusionMainLayout';
import SubAppsView from './views/SubAppsView';
import useSubApps from './hooks/useSubApps';
import useDataCart, { CartContext, CartType } from './hooks/useDataCart';
import './App.less';
import {
  getNotificationContextValue,
  NotificationContext,
  NotificationContextType,
} from './hooks/useNotification';
import { ReactQueryDevtools } from 'react-query/devtools';
import { DataPanelDetailsBar } from './organisms';
import CreateProject from './modals/CreateProject/CreateProject';
import CreateOrganization from './modals/CreateOrganization/CreateOrganization';
import CreateStudio from './modals/CreateStudio/CreateStudio';
import { useSelector } from 'react-redux';
import { RootState } from './store/reducers';

const App: React.FC = () => {
  // TODO log the error in to sentry.
  const { subAppProps, subAppRoutes, subAppError } = useSubApps();
  const cartData: CartType = useDataCart();
  const oidc = useSelector((state: RootState) => state.oidc);
  const authenticated = !!oidc.user;
  const token = oidc.user && oidc.user.access_token;
  const notificationData: NotificationContextType = getNotificationContextValue();
  const showDataPanel =
    authenticated &&
    token &&
    (location.pathname === '/' ||
      location.pathname === '/search' ||
      location.pathname === '/my-data');

  // Apply Subapp routes
  const routesWithSubApps = [...routes, ...subAppRoutes];
  return (
    <CartContext.Provider value={cartData}>
      <NotificationContext.Provider value={notificationData}>
        <ReactQueryDevtools initialIsOpen={false} />
        <FusionMainLayout subApps={subAppProps}>
          <SubAppsView routesWithSubApps={routesWithSubApps} />
          <GalleryView />
          <CreateProject />
          <CreateOrganization />
          <CreateStudio />
          {showDataPanel && <DataPanelDetailsBar />}
        </FusionMainLayout>
      </NotificationContext.Provider>
    </CartContext.Provider>
  );
};

export default App;
