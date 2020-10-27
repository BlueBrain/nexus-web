import * as React from 'react';
import GalleryView from './views/GalleryView';
import routes from '../shared/routes';
import FusionMainLayout, { SubAppProps } from './layouts/FusionMainLayout';
import SubApps, { SubAppObject, SubApp } from '../subapps/index';
import SubAppsView from './views/SubAppsView';
import { RootState } from '../shared/store/reducers';
import { useSelector } from 'react-redux';
import './App.less';
import useSubApps from './hooks/useSubApps';

const App: React.FC = () => {
  // TODO log the error in to sentry.
  const { subAppProps, subAppRoutes, subAppError } = useSubApps();

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
