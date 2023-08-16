import * as React from 'react';
import Helmet from 'react-helmet';
import favicon from '../favicon.png';

const TITLE = 'A knowledge graph for data-driven science';
const DESCRIPTION =
  'Nexus - Transform your data into a fully searchable linked-data graph';

const SeoHeaders: React.FC = () => {
  return (
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
      {/* If browser supports customizing color of surrounding UI via theme-color set to @fusion-secondary-color */}
      <meta name="theme-color" content="#7cb4fa" />
    </Helmet>
  );
};

export default SeoHeaders;
