import * as React from 'react';

import GalleryView from './views/GalleryView';
import routes from '../shared/routes';
import FusionMainLayout from './layouts/FusionMainLayout';
import SubAppsView from './views/SubAppsView';
import useSubApps from './hooks/useSubApps';

import './App.less';

const App: React.FC = () => {
  // TODO log the error in to sentry.
  const { subAppProps, subAppRoutes, subAppError } = useSubApps();
  console.log(subAppRoutes);

  // Apply Subapp routes
  const routesWithSubApps = [...routes, ...subAppRoutes];

  return (
    <FusionMainLayout subApps={subAppProps}>
      <SubAppsView routesWithSubApps={routesWithSubApps} />
      <GalleryView />
    </FusionMainLayout>
  );
};

export default App;
