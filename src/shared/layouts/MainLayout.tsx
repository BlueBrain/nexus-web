import React = require('react');
import Helmet from 'react-helmet';

const TITLE = "Nexus Explorer - Search thousands of datasets using Nexus";

const MainLayout: React.StatelessComponent = ({ children }) => (
  <React.Fragment>
    <Helmet>
      <meta charSet="utf-8" />
      <link rel='shortcut icon' type='image/x-icon' href='/public/favicon.ico' />
      <title>{TITLE}</title>
      <meta id="app-description" name="description" content={"A quality description of the Nexus Application"} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@bluebrainnexus" />
      <meta property="og:image" content="some_image.png" />
      <meta property="og:image:width" content="600" />
      <meta property="og:image:height" content="315" />
      <meta property="og:site_name" content="Nexus Explorer" />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={"A quality description of the Nexus Application"} />
      <meta name="theme-color" content="#00c9fd" />
    </Helmet>
    {children}
  </React.Fragment>
);

export default MainLayout;
