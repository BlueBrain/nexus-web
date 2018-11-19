import * as React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { push } from 'connected-react-router';
import Header from '../components/Header';
import { AuthState } from '../store/reducers/auth';

const TITLE =
  'Nexus - Transform your data into a fully searchable linked-data graph';

export interface MainLayoutProps {
  authenticated: boolean;
  logoutUrl: string;
  hostName: string;
  goTo(url: string): void;
}

const MainLayout: React.SFC<MainLayoutProps> = ({
  authenticated,
  goTo,
  logoutUrl,
  hostName,
  children,
}) => (
  <React.Fragment>
    <Helmet>
      <meta charSet="utf-8" />
      <link
        rel="shortcut icon"
        type="image/x-icon"
        href="/public/favicon.ico"
      />
      <title>{TITLE}</title>
      <meta
        id="app-description"
        name="description"
        content="A quality description of the Nexus Application"
      />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@bluebrainnexus" />
      <meta property="og:image" content="some_image.png" />
      <meta property="og:image:width" content="600" />
      <meta property="og:image:height" content="315" />
      <meta property="og:site_name" content="Nexus Explorer" />
      <meta property="og:title" content={TITLE} />
      <meta
        property="og:description"
        content="A quality description of the Nexus Application"
      />
      <meta name="theme-color" content="#00c9fd" />
    </Helmet>
    <Header
      name={authenticated ? 'Welcome' : undefined}
      links={[<a href={`${logoutUrl}?redirect_uri=${hostName}`}>log out</a>]}
      onLoginClick={() => goTo('/login')}
    />
    {children}
  </React.Fragment>
);

const mapStateToProps = ({ auth }: { auth: AuthState }) => ({
  authenticated: auth.authenticated,
  logoutUrl: auth.endSessionEndpoint || '',
  hostName: auth.authorizationEndpoint || '',
});

const mapDispatchToProps = (dispatch: any) => ({
  goTo: (url: string) => dispatch(push(url)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainLayout);
