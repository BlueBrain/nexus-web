import * as React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
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

import './MainLayout.less';

const favicon = require('../favicon.png');
const TITLE = 'A knowledge graph for data-driven science';
const DESCRIPTION =
  'Nexus - Transform your data into a fully searchable linked-data graph';

export interface MainLayoutProps {
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

const MainLayout: React.FunctionComponent<MainLayoutProps> = ({
  authenticated,
  token,
  goTo,
  name,
  children,
  canLogin = false,
  userManager,
  apiEndpoint,
}) => {
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
        onLoginClick={() => goTo(`/login${getDestinationParam()}`)}
        version={version}
        githubIssueURL={githubIssueURL}
        serviceVersions={versions.data}
        consent={consent}
        onClickRemoveConsent={() => setConsent(undefined)}
      />
      <ConsentContainer consent={consent} updateConsent={setConsent} />
      <div className="MainLayout_body">{children}</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(MainLayout);
