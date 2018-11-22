import * as React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { push } from 'connected-react-router';
import Header from '../components/Header';
import { AuthState } from '../store/reducers/auth';

const favicon = require('../favicon.png');
const TITLE = 'A knowledge graph for data-driven science';
const DESCRIPTION =
  'Nexus - Transform your data into a fully searchable linked-data graph';

export interface MainLayoutProps {
  authenticated: boolean;
  logoutUrl: string;
  hostName: string;
  goTo(url: string): void;
  name: string;
}

const MainLayout: React.SFC<MainLayoutProps> = ({
  authenticated,
  goTo,
  logoutUrl,
  hostName,
  name,
  children,
}) => (
  <React.Fragment>
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
      links={[
        <a href={`${logoutUrl}?redirect_uri=${hostName}/authLogout`}>
          log out
        </a>,
      ]}
      onLoginClick={() => goTo('/login')}
    />
    {children}
  </React.Fragment>
);

const mapStateToProps = ({ auth }: { auth: AuthState }) => ({
  authenticated: auth.authenticated,
  name: auth.tokenData ? (auth.tokenData as any)['name'] : '',
  logoutUrl: auth.endSessionEndpoint || '',
  hostName: auth.redirectHostName || '',
});

const mapDispatchToProps = (dispatch: any) => ({
  goTo: (url: string) => dispatch(push(url)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainLayout);
