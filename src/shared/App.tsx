import * as React from 'react';
import { useLocation } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { ReactQueryDevtools } from 'react-query/devtools';
import { parseUserAgent } from 'react-device-detect';
import { useNexus } from '@bbp/react-nexus';
import { Identity, NexusClient, Realm } from '@bbp/nexus-sdk';
import GalleryView from './views/GalleryView';
import routes from '../shared/routes';
import FusionMainLayout, { ConsentType } from './layouts/FusionMainLayout';
import SubAppsView from './views/SubAppsView';
import useSubApps from './hooks/useSubApps';
import useDataCart, { CartContext, CartType } from './hooks/useDataCart';
import { url as githubIssueURL } from '../../package.json';
import {
  getNotificationContextValue,
  NotificationContext,
  NotificationContextType,
} from './hooks/useNotification';
import { withDataPanel } from './organisms/DataPanel/DataPanel';
import { RootState } from './store/reducers';
import { updateAboutModalVisibility } from './store/actions/modals';
import useLocalStorage from './hooks/useLocalStorage';
import CreateProject from './modals/CreateProject/CreateProject';
import CreateOrganization from './modals/CreateOrganization/CreateOrganization';
import CreateStudio from './modals/CreateStudio/CreateStudio';
import AppInfo from './modals/AppInfo/AppInfo';
import './App.less';

declare var COMMIT_HASH: string;
declare var FUSION_VERSION: string;

const App: React.FC = () => {
  // TODO log the error in to sentry.
  const { subAppProps, subAppRoutes, subAppError } = useSubApps();
  const location = useLocation();
  const dispatch = useDispatch();
  const cartData: CartType = useDataCart();
  const { auth, oidc, config, modals } = useSelector((state: RootState) => ({
    oidc: state.oidc,
    auth: state.auth,
    config: state.config,
    modals: state.modals,
  }));
  const authenticated = !!oidc.user;
  const token = oidc.user && oidc.user.access_token;
  const notificationData: NotificationContextType = getNotificationContextValue();
  const userAuthenticated = Boolean(authenticated) && Boolean(token);
  const realms: Realm[] =
    (auth.realms && auth.realms.data && auth.realms.data._results) || [];
  const identities: Identity[] =
    (auth.identities &&
      auth.identities.data &&
      auth.identities.data.identities) ||
    [];
  const allowDataPanel =
    userAuthenticated &&
    (location.pathname === '/' ||
      location.pathname === '/search' ||
      location.pathname === '/my-data');

  const [consent] = useLocalStorage<ConsentType>('consentToTracking');
  const splits = config.apiEndpoint.split('/');
  const apiBase = splits.slice(0, splits.length - 1).join('/');
  const versions: any = useNexus<any>((nexus: NexusClient) =>
    nexus.httpGet({
      path: `${apiBase}/v1/version`,
      context: { as: 'json' },
    })
  );
  const deltaVersion = React.useMemo(() => {
    if (versions.data) {
      return versions.data.delta as string;
    }
    return '';
  }, [versions]);

  const environmentName = React.useMemo(() => {
    if (versions.data) {
      return versions.data.environment as string;
    }
    return '';
  }, [versions]);
  const userPlatform = parseUserAgent(navigator.userAgent);
  const browser = `${userPlatform.browser?.name ?? ''} ${userPlatform.browser
    ?.version ?? ''}`;
  const operatingSystem = `${userPlatform.os?.name ?? ''} ${userPlatform.os
    ?.version ?? ''}`;
  const routesWithSubApps = [...routes, ...subAppRoutes];
  const DataPanel = withDataPanel({ allowDataPanel });
  const onAboutModalClose = () => dispatch(updateAboutModalVisibility(false));
  return (
    <CartContext.Provider value={cartData}>
      <NotificationContext.Provider value={notificationData}>
        <ReactQueryDevtools initialIsOpen={false} />
        <FusionMainLayout subApps={subAppProps}>
          <SubAppsView routesWithSubApps={routesWithSubApps} />
          {userAuthenticated && (
            <>
              <GalleryView />
              <CreateProject />
              <CreateOrganization />
              <CreateStudio />
              <DataPanel />
            </>
          )}
          <AppInfo
            {...{
              githubIssueURL,
              consent,
            }}
            visible={modals.aboutModel}
            onCloseModal={onAboutModalClose}
            commitHash={COMMIT_HASH}
            environment={{
              deltaVersion,
              operatingSystem,
              browser,
              environmentName,
              fusionVersion: FUSION_VERSION,
            }}
          />
        </FusionMainLayout>
      </NotificationContext.Provider>
    </CartContext.Provider>
  );
};

export default App;
