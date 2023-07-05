import * as React from 'react';
import { useSelector } from 'react-redux';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useQuery } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
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
import { RootState } from './store/reducers';
import DataPanel from './organisms/DataPanel/DataPanel';
import CreateProject from './modals/CreateProject/CreateProject';
import CreateOrganization from './modals/CreateOrganization/CreateOrganization';
import CreateStudio from './modals/CreateStudio/CreateStudio';
import AppInfo from './modals/AppInfo/AppInfo';
import ResolvedLinkEditorPopover from './molecules/ResolvedLinkEditorPopover/ResolvedLinkEditorPopover';
import './App.less';

const App: React.FC = () => {
  const nexus = useNexusContext();
  const { subAppRoutes } = useSubApps();
  const cartData: CartType = useDataCart();
  const { oidc, config } = useSelector((state: RootState) => ({
    oidc: state.oidc,
    config: state.config,
  }));
  const authenticated = !!oidc.user;
  const token = oidc.user && oidc.user.access_token;
  const notificationData: NotificationContextType = getNotificationContextValue();
  const userAuthenticated = Boolean(authenticated) && Boolean(token);
  const routesWithSubApps = [...routes, ...subAppRoutes];

  const { data: nexusEcosystem } = useQuery({
    queryKey: ['nexus-ecosystem'],
    queryFn: () =>
      nexus.httpGet({
        path: `${config.apiEndpoint}/version`,
        context: { as: 'json' },
      }),
  });

  return (
    <CartContext.Provider value={cartData}>
      <NotificationContext.Provider value={notificationData}>
        <ReactQueryDevtools initialIsOpen={false} />
        <FusionMainLayout environment={nexusEcosystem?.environment}>
          <SubAppsView routesWithSubApps={routesWithSubApps} />
          <AppInfo {...{ ...nexusEcosystem }} />
          <ResolvedLinkEditorPopover />
          <DataPanel />
          <GalleryView />
          {userAuthenticated && (
            <React.Fragment>
              <CreateProject />
              <CreateOrganization />
              <CreateStudio />
            </React.Fragment>
          )}
        </FusionMainLayout>
      </NotificationContext.Provider>
    </CartContext.Provider>
  );
};

export default App;
