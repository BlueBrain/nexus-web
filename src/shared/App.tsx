import * as React from 'react';

import GalleryView from './views/GalleryView';
import routes from '../shared/routes';
import FusionMainLayout from './layouts/FusionMainLayout';
import SubAppsView from './views/SubAppsView';
import useSubApps from './hooks/useSubApps';
import useDataCart, { CartContext, CartType } from './hooks/useDataCart';

import './App.less';

const App: React.FC = () => {
  // TODO log the error in to sentry.
  const { subAppProps, subAppRoutes, subAppError } = useSubApps();
  const cartData: CartType = useDataCart();

  // Apply Subapp routes
  const routesWithSubApps = [...routes, ...subAppRoutes];

  return (
    <CartContext.Provider value={cartData}>
      <FusionMainLayout subApps={subAppProps}>
        <SubAppsView routesWithSubApps={routesWithSubApps} />
        <GalleryView />
      </FusionMainLayout>
    </CartContext.Provider>
  );
};

export default App;
