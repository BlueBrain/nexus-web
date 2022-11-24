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

const App: React.FC = () => {
  // TODO log the error in to sentry.
  const { subAppProps, subAppRoutes, subAppError } = useSubApps();
  const cartData: CartType = useDataCart();

  const notificationData: NotificationContextType = getNotificationContextValue();

  // Apply Subapp routes
  const routesWithSubApps = routes;

  return (
    <CartContext.Provider value={cartData}>
      <NotificationContext.Provider value={notificationData}>
        <ReactQueryDevtools initialIsOpen={false} />
        <FusionMainLayout subApps={subAppProps}>
          <SubAppsView routesWithSubApps={routesWithSubApps} />
          <GalleryView />
        </FusionMainLayout>
      </NotificationContext.Provider>
    </CartContext.Provider>
  );
};

export default App;
