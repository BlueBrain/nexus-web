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

const logo = require('../images/logoDarkBg.svg');

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
}

export type ConsentType = {
  consentToTracking: boolean;
  hasSetPreferences: boolean;
};

export type SubAppProps = {
  label: string;
  key: string;
  route: string;
  icon: any;
};

const homeIcon = require('../images/homeIcon.svg');

const homeApp = {
  label: 'Home',
  key: 'home',
  route: '/',
  icon: homeIcon,
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
    if (item) {
      goTo(item.route);
    }
  };

  return (
    <>
      <SeoHeaders />
      <Layout className="fusion-main-layout">
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{ height: '100vh' }}
        >
          <Link to={'/'}>
            <div className="logo">
              {/* must add inline styling to prevent this big svg from flashing
            the screen on dev mode before styles are loaded */}
              <img width="32" height="32" src={logo} alt="Fusion" />
              {!collapsed && <span className="fusion-title">Fusion</span>}
            </div>
          </Link>
          <div className="menu-wrapper">
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={
                selectedItem ? [selectedItem.key] : [subApps[0].key]
              }
              selectedKeys={[selectedItem.key]}
              onClick={onSelectSubAbpp}
            >
              {subApps.map(subApp => (
                <Menu.Item key={subApp.key}>
                  <div className="menu-item">
                    {/* TODO: change icons color with CSS to blue when it is selected https://github.com/BlueBrain/nexus/issues/1324 */}
                    <img className="menu-icon" src={subApp.icon} />
                    {!collapsed && <span>{subApp.label}</span>}
                  </div>
                  {selectedItem.key === subApp.key && (
                    <div
                      className={`indicator${collapsed ? ' collapsed' : ''}`}
                    />
                  )}
                </Menu.Item>
              ))}
            </Menu>
            <div className="menu-extras-container">
              <button
                className="menu-collapse-button"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <RightCircleOutlined /> : <LeftCircleOutlined />}
              </button>
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
  return {
    realms,
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
