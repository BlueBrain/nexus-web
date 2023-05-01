import * as React from 'react';
import { useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { ReactQueryDevtools } from 'react-query/devtools';
import GalleryView from './views/GalleryView';
import routes from '../shared/routes';
import FusionMainLayout from './layouts/FusionMainLayout';
import SubAppsView from './views/SubAppsView';
import useSubApps from './hooks/useSubApps';
import useDataCart, { CartContext, CartType } from './hooks/useDataCart';
import {
  getNotificationContextValue,
  NotificationContext,
  NotificationContextType,
} from './hooks/useNotification';
import { withDataPanel } from './organisms/DataPanel/DataPanel';
import { RootState } from './store/reducers';
import CreateProject from './modals/CreateProject/CreateProject';
import CreateOrganization from './modals/CreateOrganization/CreateOrganization';
import CreateStudio from './modals/CreateStudio/CreateStudio';
import AppInfo from './modals/AppInfo/AppInfo';
import './App.less';

const App: React.FC = () => {
  const location = useLocation();
  const { subAppRoutes } = useSubApps();
  const cartData: CartType = useDataCart();
  const oidc = useSelector((state: RootState) => state.oidc);
  const authenticated = !!oidc.user;
  const token = oidc.user && oidc.user.access_token;
  const notificationData: NotificationContextType = getNotificationContextValue();
  const userAuthenticated = Boolean(authenticated) && Boolean(token);

  const allowDataPanel =
    userAuthenticated &&
    (location.pathname === '/' ||
      location.pathname === '/search' ||
      location.pathname === '/my-data');

  const routesWithSubApps = [...routes, ...subAppRoutes];
  const DataPanel = withDataPanel({ allowDataPanel });

  return (
    <CartContext.Provider value={cartData}>
      <NotificationContext.Provider value={notificationData}>
        <ReactQueryDevtools initialIsOpen={false} />
        <FusionMainLayout>
          <SubAppsView routesWithSubApps={routesWithSubApps} />
          <AppInfo />
          {userAuthenticated && (
            <>
              <GalleryView />
              <CreateProject />
              <CreateOrganization />
              <CreateStudio />
              <DataPanel />
            </>
          )}
        </FusionMainLayout>
      </NotificationContext.Provider>
    </CartContext.Provider>
  );
};

export default App;
