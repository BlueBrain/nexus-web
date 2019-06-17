import * as React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { push } from 'connected-react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import getUserManager from '../../client/userManager';
import { version, url as githubIssueURL } from '../../../package.json';

import './MainLayout.less';
import { Identity } from '@bbp/nexus-sdk/lib/ACL/types';
import { Realm } from '@bbp/nexus-sdk';
import { getLogoutUrl } from '../utils';
import { UserManager } from 'oidc-client';
import { RootState } from '../store/reducers';

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
}) => {
  const handleLogout = (e: React.SyntheticEvent) => {
    e.preventDefault();
    localStorage.removeItem('nexus__state');
    userManager && userManager.signoutRedirect();
  };

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
        onLoginClick={() => goTo('/login')}
      />
      <div className="MainLayout_body">{children}</div>
      <div>
        <Footer version={version} githubIssueURL={githubIssueURL} />
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  const { auth, oidc } = state;
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
