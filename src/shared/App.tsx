import { useSelector } from 'react-redux';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useQueries } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { ConfigProvider } from 'antd';
import { antdTheme } from 'theme/antd';
import { IdentityList } from '@bbp/nexus-sdk/es/types';
import GalleryView from './views/GalleryView';
import routes from '../shared/routes';
import FusionMainLayout from './layouts/FusionMainLayout';
import SubAppsView from './views/SubAppsView';
import useSubApps from './hooks/useSubApps';
import {
  getNotificationContextValue,
  NotificationContext,
  NotificationContextType,
} from './hooks/useNotification';
import { RootState } from './store/reducers';
import DataPanel from './organisms/DataPanel/DataPanel';
import AppInfo from './modals/AppInfo/AppInfo';
import EntityCreation from './modals';
import { fetchIdentitiesFulfilledAction } from './store/actions/auth';
import store from '../store';
import './App.scss';

const App: React.FC = () => {
  const nexus = useNexusContext();
  const { subAppRoutes } = useSubApps();
  const config = useSelector((state: RootState) => state.config);

  const notificationData: NotificationContextType = getNotificationContextValue();
  const routesWithSubApps = [...routes, ...subAppRoutes];

  const [{ data: nexusEcosystem }] = useQueries([
    {
      queryKey: ['nexus-ecosystem'],
      queryFn: () =>
        nexus.httpGet({
          path: `${config.apiEndpoint}/version`,
          context: { as: 'json' },
        }),
      refetchOnWindowFocus: false,
    },
    {
      queryKey: ['nexus-identities'],
      queryFn: () => nexus.Identity.list(),
      refetchOnWindowFocus: false,
      onSuccess: (data: IdentityList) => {
        console.log('@@onSuccess', data);
        store.dispatch(fetchIdentitiesFulfilledAction(data));
      },
    },
  ]);

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
