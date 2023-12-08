import './App.scss';

import { useNexusContext } from '@bbp/react-nexus';
import { ConfigProvider } from 'antd';
import { useQuery } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useSelector } from 'react-redux';
import { antdTheme } from 'theme/antd';

import routes from '../shared/routes';
import {
  getNotificationContextValue,
  NotificationContext,
  NotificationContextType,
} from './hooks/useNotification';
import useSubApps from './hooks/useSubApps';
import FusionMainLayout from './layouts/FusionMainLayout';
import EntityCreation from './modals';
import AppInfo from './modals/AppInfo/AppInfo';
import DataPanel from './organisms/DataPanel/DataPanel';
import { RootState } from './store/reducers';
import GalleryView from './views/GalleryView';
import SubAppsView from './views/SubAppsView';

const App: React.FC = () => {
  const nexus = useNexusContext();
  const { subAppRoutes } = useSubApps();
  const config = useSelector((state: RootState) => state.config);

  const notificationData: NotificationContextType = getNotificationContextValue();
  const routesWithSubApps = [...routes, ...subAppRoutes];

  const { data: nexusEcosystem } = useQuery({
    queryKey: ['nexus-ecosystem'],
    queryFn: () =>
      nexus.httpGet({
        path: `${config.apiEndpoint}/version`,
        context: { as: 'json' },
      }),
    refetchOnWindowFocus: false,
  });

  return (
    <ConfigProvider theme={antdTheme}>
      <NotificationContext.Provider value={notificationData}>
        <ReactQueryDevtools initialIsOpen={false} />
        <FusionMainLayout environment={nexusEcosystem?.environment}>
          <SubAppsView routesWithSubApps={routesWithSubApps} />
          <AppInfo {...{ ...nexusEcosystem }} />
          <DataPanel />
          <GalleryView />
          <EntityCreation />
        </FusionMainLayout>
      </NotificationContext.Provider>
    </ConfigProvider>
  );
};

export default App;
