import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { NexusClient, Identity, Realm } from '@bbp/nexus-sdk';
import { useNexus } from '@bbp/react-nexus';
import { UserManager } from 'oidc-client';

import Header, { ServiceVersions } from '../components/Header';
import getUserManager from '../../client/userManager';
import { getLogoutUrl, getDestinationParam } from '../utils';
import { RootState } from '../store/reducers';
import { version, url as githubIssueURL } from '../../../package.json';
import useLocalStorage from '../hooks/useLocalStorage';
import ConsentContainer from '../containers/ConsentContainer';
import SeoHeaders from './SeoHeaders';

import { Layout, Menu } from 'antd';
const { Sider, Content } = Layout;

import './FusionMainLayout.less';

const logo = require('../images/logo.svg');

export interface FusionMainLayoutProps {
  authenticated: boolean;
  token?: string;
  goTo(url: string): void;
  name?: string;
  canLogin?: boolean;
  userManager?: UserManager;
  apiEndpoint: string;
}

export type ConsentType = {
  consentToTracking: boolean;
  hasSetPreferences: boolean;
};

const homeIcon = require('../images/homeIcon.svg');
const flowIcon = require('../images/flowIcon.svg');
const gridIcon = require('../images/gridIcon.svg');
const dbIcon = require('../images/dbIcon.svg');

const subAppsConfig = [
  {
    label: 'Home',
    key: 'home',
    route: '/',
    icon: homeIcon,
  },
  {
    label: 'Studios',
    key: 'studios',
    route: '/',
    icon: flowIcon,
  },
  {
    label: 'Studios Legacy',
    key: 'studios-legacy',
    route: '/studio',
    icon: gridIcon,
  },
  {
    label: 'Knowledge Admin',
    key: 'admin',
    route: '/',
    icon: dbIcon,
  },
];

const FusionMainLayout: React.FC<FusionMainLayoutProps> = ({
  authenticated,
  token,
  goTo,
  name,
  children,
  canLogin = false,
  userManager,
  apiEndpoint,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(subAppsConfig[0]);

  const handleLogout = (e: React.SyntheticEvent) => {
    e.preventDefault();
    localStorage.removeItem('nexus__state');
    userManager && userManager.signoutRedirect();
  };

  const [consent, setConsent] = useLocalStorage<ConsentType>(
    'consentToTracking'
  );

  // Remove version from API URL
  const splits = apiEndpoint.split('/');
  const apiBase = splits.slice(0, splits.length - 1).join('/');
  const versions = useNexus<ServiceVersions>((nexus: NexusClient) =>
    nexus.httpGet({
      path: `${apiBase}/version`,
      context: { as: 'json' },
    })
  );

  const onSelectSubAbpp = (data: any) => {
    const item = subAppsConfig.find(subApp => subApp.key === data.key);
    // @ts-ignore
    setSelectedItem(item);
    console.log('item', item);

    console.log('selectedItem', data.key, selectedItem);

    goTo(selectedItem.route);
  };

  return (
    <>
      <SeoHeaders />
      <Layout className="fusion-main-layout">
        <Sider trigger={null} collapsible collapsed={collapsed}>
          <div className="logo">
            {/* must add inline styling to prevent this big svg from flashing
            the screen on dev mode before styles are loaded */}
            <img width="20px" height="30px" src={logo} alt="Fusion" />
            <span className="fusion-title">Fusion</span>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={[subAppsConfig[0].key]}
            selectedKeys={[selectedItem.key]}
            style={{ height: '100vh' }}
            onClick={onSelectSubAbpp}
          >
            {subAppsConfig.map(subApp => (
              <Menu.Item key={subApp.key}>
                <div className="menu-item">
                  <img className="menu-icon" src={subApp.icon} />
                  <span>{subApp.label}</span>
                  {selectedItem.key === subApp.key && (
                    <span className="indicator" />
                  )}
                </div>
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
        <Layout className="site-layout">
          <Header
            name={authenticated ? name : undefined}
            token={token}
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
            onLoginClick={() => goTo(`/login${getDestinationParam()}`)}
            version={version}
            githubIssueURL={githubIssueURL}
            serviceVersions={versions.data}
            consent={consent}
            onClickRemoveConsent={() => setConsent(undefined)}
          />
          <ConsentContainer consent={consent} updateConsent={setConsent} />
          <Content
            className="site-layout-background"
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
            }}
          >
            {children}
          </Content>
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
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  goTo: (url: string) =>
    dispatch(push(url, { previousUrl: window.location.href })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FusionMainLayout);
