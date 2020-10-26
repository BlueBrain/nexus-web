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
  const [subAppsState, subAppRoutes] = useSubApps();

  // Apply Subapp routes
  const routesWithSubApps = [...routes, ...subAppRoutes];
  return (
    <FusionMainLayout
      subApps={Array.from(subAppsState.values()).map(subApp => ({
        label: subApp.title,
        key: subApp.title,
        subAppType: subApp.subAppType,
        url: subApp.url,
        route: `/${subApp.namespace}`,
        icon: subApp.icon,
      }))}
    >
      <SubAppsView routesWithSubApps={routesWithSubApps} />
      <GalleryView />
    </FusionMainLayout>
  );
};

export default App;
