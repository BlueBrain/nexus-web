import * as React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { push } from 'connected-react-router';
import  Header, { serviceVersions } from '../components/Header';
import getUserManager from '../../client/userManager';
import { version, url as githubIssueURL } from '../../../package.json';

import './MainLayout.less';
import { Identity } from '@bbp/nexus-sdk-legacy/lib/ACL/types';
import { Realm } from '@bbp/nexus-sdk-legacy';
import { getLogoutUrl, getDestinationParam } from '../utils';
import { UserManager } from 'oidc-client';
import { RootState } from '../store/reducers';
import { NexusClient } from '@bbp/nexus-sdk';
import { useNexus } from '@bbp/react-nexus';


const favicon = require('../favicon.png');
const TITLE = 'A knowledge graph for data-driven science';
const DESCRIPTION =
  'Nexus - Transform your data into a fully searchable linked-data graph';

export interface MainLayoutProps {
  authenticated: boolean;
  token?: string;
  goTo(url: string): void;
  name: string;
  canLogin?: boolean;
  userManager?: UserManager;
  userIdentity: Identity;
  apiEndpoint: string;
}

const MainLayout: React.FunctionComponent<MainLayoutProps> = ({
  authenticated,
  token,
  goTo,
  name,
  children,
  canLogin = false,
  userManager,
  userIdentity,
  apiEndpoint
}) => {
  const handleLogout = (e: React.SyntheticEvent) => {
    e.preventDefault();
    localStorage.removeItem('nexus__state');
    userManager && userManager.signoutRedirect();
  };

  
  const apiBase = new URL(apiEndpoint);
  const versions = useNexus<serviceVersions>(
    (nexus: NexusClient) =>
      nexus.httpGet({ path: `${apiBase.origin}/version`, context: { as: 'json' } }),
  );

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <link rel="shortcut icon" type="image/x-icon" href={favicon} />
        <title>{TITLE}</title>
        <meta id="app-description" name="description" content={DESCRIPTION} />
        <meta name="twitter:card" content={DESCRIPTION} />
        <meta name="twitter:site" content="@bluebrainnexus" />
        <meta
          property="og:image"
          content="https://bluebrain.github.io/nexus/assets/img/logo.png"
        />
        <meta property="og:image:width" content="745" />
        <meta property="og:image:height" content="745" />
        <meta property="og:site_name" content="Nexus" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta name="theme-color" content="#00c9fd" />
      </Helmet>
      <Header
        visitHome={() => goTo('/')}
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
      />
      <div className="MainLayout_body">{children}</div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  const { auth, oidc, config } = state;
  const realms: Realm[] =
    (auth.realms && auth.realms.data && auth.realms.data.results) || [];
  const identities: Identity[] =
    (auth.identities && auth.identities.data) || [];
  return {
    authenticated: oidc.user !== undefined,
    token: oidc.user && oidc.user.access_token,
    name: oidc.user && oidc.user.profile && oidc.user.profile.name,
    logoutUrl: getLogoutUrl(identities, realms),
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainLayout);
