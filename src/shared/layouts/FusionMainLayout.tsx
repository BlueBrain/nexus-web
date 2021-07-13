import * as React from 'react';
import { connect, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { useLocation } from 'react-router-dom';
import { NexusClient, Identity, Realm } from '@bbp/nexus-sdk';
import { useNexus } from '@bbp/react-nexus';
import { UserManager } from 'oidc-client';
import { Layout } from 'antd';

import Header from '../components/Header';
import SeoHeaders from './SeoHeaders';
import ConsentContainer from '../containers/ConsentContainer';
import * as configActions from '../store/actions/config';
import * as authActions from '../store/actions/auth';
import { RootState } from '../store/reducers';
import getUserManager from '../../client/userManager';
import { getLogoutUrl } from '../utils';
import { url as githubIssueURL } from '../../../package.json';
import useLocalStorage from '../hooks/useLocalStorage';
import SearchBarContainer from '../containers/SearchBarContainer';
import DataCartContainer from '../containers/DataCartContainer';
import SideMenu from './SideMenu';

import './FusionMainLayout.less';
import useNotification from '../hooks/useNotification';

const { Sider, Content } = Layout;

declare var COMMIT_HASH: string;

export interface FusionMainLayoutProps {
  authenticated: boolean;
  realms: Realm[];
  token?: string;
  name?: string;
  canLogin?: boolean;
  loginError?: {
    error: Error;
  };
  userManager?: UserManager;
  apiEndpoint: string;
  children: any[];
  subApps: SubAppProps[];
  setPreferredRealm(name: string): void;
  performLogin(): void;
  layoutSettings: {
    logoLink: string;
    logoImg: string;
    forgeLink: string;
  };
}

export type ConsentType = {
  consentToTracking: boolean;
  hasSetPreferences: boolean;
};

export type SubAppProps = {
  subAppType: string;
  label: string;
  key: string;
  route: string;
  icon: any;
  url?: string;
  requireLogin?: boolean;
  description?: string;
};

const homeIcon = require('../images/homeIcon.svg');

const homeApp = {
  label: 'Home',
  key: 'home',
  route: '/',
  icon: homeIcon,
  subAppType: 'internal',
  url: undefined,
  requireLogin: false,
};

const FusionMainLayout: React.FC<FusionMainLayoutProps> = ({
  authenticated,
  realms,
  token,
  name,
  children,
  canLogin = false,
  userManager,
  subApps: propSubApps,
  apiEndpoint,
  loginError,
  setPreferredRealm,
  performLogin,
  layoutSettings,
}) => {
  const subApps = [homeApp, ...propSubApps];
  const location = useLocation();
  const dispatch = useDispatch();
  const notification = useNotification();
  //   TODO: collapsed version https://github.com/BlueBrain/nexus/issues/1322
  const [collapsed, setCollapsed] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<SubAppProps>(
    subApps.find(({ route }) => {
      return `/${location.pathname.split('/')[1]}` === route;
    }) || subApps[0]
  );

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

  React.useEffect(() => {
    const currentSubApp =
      subApps.find(({ route }) => {
        return `/${location.pathname.split('/')[1]}` === route;
      }) || subApps[0];
    setSelectedItem(currentSubApp);
  }, [location]);

  React.useEffect(() => {
    if (loginError) {
      notification.error({
        message: 'We could not log you in',
        description: (
          <div>
            <p>We could not log you in due to :</p>{' '}
            <p>{loginError.error.message}</p>
            <p>Please contact your system administrators.</p>
          </div>
        ),
      });
    }
  }, [loginError]);

  const [consent, setConsent] = useLocalStorage<ConsentType>(
    'consentToTracking'
  );

  const goTo = (url: string) => {
    dispatch(push(url, { previousUrl: window.location.href }));
  };

  const handleLogout = (e: React.SyntheticEvent) => {
    e.preventDefault();
    localStorage.removeItem('nexus__state');
    userManager && userManager.signoutRedirect();
  };

  const login = async (realmName: string) => {
    setPreferredRealm(realmName);
    performLogin();
  };

  // Remove version from API URL
  const splits = apiEndpoint.split('/');
  const apiBase = splits.slice(0, splits.length - 1).join('/');

  const onSelectSubAbpp = (data: any) => {
    const item = subApps.find(subApp => subApp.key === data.key);
    setSelectedItem(item as SubAppProps);
    if (item && item.subAppType === 'internal') {
      goTo(item.route);
    }
  };

  return (
    <>
      <SeoHeaders />
      <Layout className="fusion-main-layout">
        <Header
          name={authenticated ? name : undefined}
          token={token}
          realms={realms}
          performLogin={login}
          links={[
            <a
              href="/user"
              onClick={(e: React.SyntheticEvent) => {
                e.preventDefault();
                goTo(`/user`);
              }}
            >
              User Info
            </a>,
            <a href="" onClick={handleLogout}>
              Log out
            </a>,
          ]}
          displayLogin={canLogin}
          version={deltaVersion}
          githubIssueURL={githubIssueURL}
          forgeLink={layoutSettings.forgeLink}
          consent={consent}
          commitHash={COMMIT_HASH}
          onClickRemoveConsent={() => setConsent(undefined)}
          onClickSideBarToggle={() => setCollapsed(!collapsed)}
          dataCart={<DataCartContainer />}
        >
          <SearchBarContainer />
        </Header>
        <ConsentContainer consent={consent} updateConsent={setConsent} />
        <SideMenu
          selectedItem={selectedItem}
          collapsed={collapsed}
          onSelectSubAbpp={onSelectSubAbpp}
          subApps={subApps}
          authenticated={authenticated}
          onClickCollapse={() => setCollapsed(!collapsed)}
          layoutSettings={layoutSettings}
        />
        <Content
          className={`${
            collapsed ? `fusion-main-layout__content--collapsed` : ''
          } site-layout-background fusion-main-layout__content`}
        >
          {children}
        </Content>
      </Layout>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  const { auth, oidc, config } = state;
  const realms: Realm[] =
    (auth.realms && auth.realms.data && auth.realms.data._results) || [];
  const identities: Identity[] =
    (auth.identities &&
      auth.identities.data &&
      auth.identities.data.identities) ||
    [];
  const { layoutSettings } = config;

  return {
    realms,
    layoutSettings,
    authenticated: oidc.user !== undefined,
    token: oidc.user && oidc.user.access_token,
    name:
      oidc.user && oidc.user.profile && oidc.user.profile.preferred_username,
    logoutUrl: getLogoutUrl(
      identities,
      realms.map(r => ({
        label: r._label,
        endSessionEndpoint: r._endSessionEndpoint,
      }))
    ),
    userIdentity: identities[identities.length - 1],
    canLogin: !!(realms.length > 0),
    userManager: getUserManager(state),
    apiEndpoint: config.apiEndpoint,
    loginError: auth.loginError,
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  setPreferredRealm: (name: string) => {
    dispatch(configActions.setPreferredRealm(name));
  },
  performLogin: () => {
    dispatch(authActions.performLogin());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(FusionMainLayout);
