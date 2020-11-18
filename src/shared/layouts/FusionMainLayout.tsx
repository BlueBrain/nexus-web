import * as React from 'react';
import { connect, useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Link, useLocation } from 'react-router-dom';
import { NexusClient, Identity, Realm } from '@bbp/nexus-sdk';
import { useNexus } from '@bbp/react-nexus';
import { UserManager } from 'oidc-client';
import { Layout, Menu, notification } from 'antd';
import { RightCircleOutlined, LeftCircleOutlined } from '@ant-design/icons';

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

import './FusionMainLayout.less';

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
  //   TODO: collapsed version https://github.com/BlueBrain/nexus/issues/1322
  const [collapsed, setCollapsed] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<SubAppProps>(
    subApps.find(({ route }) => {
      return `/${location.pathname.split('/')[1]}` === route;
    }) || subApps[0]
  );

  const versions: any = useNexus<any>((nexus: NexusClient) =>
    nexus.httpGet({
      path: `${apiBase}/version`,
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
        duration: 0,
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
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <a
            className="logo-link"
            href={layoutSettings.logoLink}
            target="_blank"
          >
            <div className="logo">
              {/* must add inline styling to prevent this big svg from flashing
               the screen on dev mode before styles are loaded */}
              <img
                height="33"
                src={
                  layoutSettings.logoImg === ''
                    ? require('../images/fusion_logo.png')
                    : layoutSettings.logoImg
                }
                alt="Logo"
              />
            </div>
          </a>
          <div className="menu-wrapper">
            <Menu
              style={{ height: '100vh' }}
              theme="dark"
              mode="inline"
              defaultSelectedKeys={
                selectedItem ? [selectedItem.key] : [subApps[0].key]
              }
              selectedKeys={[selectedItem.key]}
              onClick={onSelectSubAbpp}
            >
              {subApps.map(subApp => {
                return subApp.subAppType === 'external' ? (
                  <Menu.Item key={subApp.key}>
                    <div className="menu-item">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={subApp.url ? subApp.url : ''}
                      >
                        <img className="menu-icon" src={subApp.icon} />
                        {!collapsed && <span>{subApp.label}</span>}
                      </a>
                    </div>
                    {selectedItem.key === subApp.key && (
                      <div
                        className={`indicator${collapsed ? ' collapsed' : ''}`}
                      />
                    )}
                  </Menu.Item>
                ) : subApp.requireLogin && !authenticated ? null : (
                  <Menu.Item key={subApp.key}>
                    <div className="menu-item">
                      <img className="menu-icon" src={subApp.icon} />
                      {!collapsed && <span>{subApp.label}</span>}
                    </div>
                    {selectedItem.key === subApp.key && (
                      <div
                        className={`indicator${collapsed ? ' collapsed' : ''}`}
                      />
                    )}
                  </Menu.Item>
                );
              })}
            </Menu>
            <div className="menu-extras-container">
              <div className="bottom-item-wrapper">
                <div className="bottom-item">
                  {!collapsed && (
                    <>
                      <span className="footer-note">Powered by </span>
                      <a href="https://bluebrainnexus.io/" target="_blank">
                        <img
                          height="27px"
                          src={require('../images/logoDarkBg.svg')}
                        />
                      </a>
                    </>
                  )}
                  <button
                    className="menu-collapse-button"
                    onClick={() => setCollapsed(!collapsed)}
                  >
                    {collapsed ? (
                      <RightCircleOutlined />
                    ) : (
                      <LeftCircleOutlined />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Sider>
        <Layout className="site-layout">
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
            consent={consent}
            commitHash={COMMIT_HASH}
            onClickRemoveConsent={() => setConsent(undefined)}
            onClickSideBarToggle={() => setCollapsed(!collapsed)}
          />
          <ConsentContainer consent={consent} updateConsent={setConsent} />
          <Content className="site-layout-background">{children}</Content>
        </Layout>
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
