import * as React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { push } from 'react-router-redux';
import Header from '../components/Header';
import { AuthState } from '../store/reducers/auth';

const TITLE =
  'Nexus - Transform your data into a fully searchable linked-data graph';

export interface MainLayoutProps {
  authenticated: boolean;
  goTo(url: string): void;
}

const MainLayout: React.SFC<MainLayoutProps> = ({
  authenticated,
  goTo,
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
      name={authenticated ? 'Mark Hamill' : undefined}
      links={[<Link to="/">Home</Link>, <Link to="/sample">Sample</Link>]}
      onLoginClick={() => goTo('/login')}
    />
    {children}
  </React.Fragment>
);

const mapStateToProps = ({ auth }: { auth: AuthState }) => ({
  authenticated: auth.authenticated,
});

const mapDispatchToProps = (dispatch: any) => ({
  goTo: (url: string) => dispatch(push(url)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainLayout);
