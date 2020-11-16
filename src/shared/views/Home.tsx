import * as React from 'react';
import { useSelector } from 'react-redux';
import { Card } from 'antd';
import { Link } from 'react-router-dom';

import { RootState } from '../store/reducers';

const { Meta } = Card;

const backgrounds = [
  'linear-gradient( 135deg, #90F7EC 10%, #32CCBC 100%)',
  'linear-gradient( 135deg, #CE9FFC 10%, #7367F0 100%)',
];

const style = {
  height: '1em',
  width: '100%',
};

// TODO: Fetch from a config or something
const subAppsConfig = [
  {
    namespace: '/admin',
    title: 'Admin',
    description: 'Manage, edit, and query your Nexus Delta knowledge graph',
    background: backgrounds[0],
    requireLogin: true,
  },
  {
    namespace: '/studios',
    title: 'Studios',
    description:
      'Visualize query results from Nexus Delta in customizable views',
    background: backgrounds[1],
    requireLogin: false,
  },
];

const HomeLinkCard: React.FunctionComponent<{
  namespace: string;
  title: string;
  description: string;
  background: string;
  requireLogin: boolean;
}> = ({ namespace, title, description, background, requireLogin }) => {
  return (
    <Link to={namespace} style={{ marginRight: '1em' }}>
      <Card
        key={`subapp-card-${title}`}
        hoverable
        cover={
          <div
            className="gradient-logo admin"
            style={{ ...style, backgroundImage: background }}
          ></div>
        }
      >
        <Meta title={title} description={description} />
      </Card>
    </Link>
  );
};

const Home: React.FunctionComponent = () => {
  const userLoggedIn = useSelector(
    ({ oidc }: RootState) => oidc && oidc.user !== undefined
  );

  return (
    <div
      className="home-view view-container"
      style={{ display: 'flex', flexWrap: 'wrap' }}
    >
      {subAppsConfig.map(subApp => {
        return subApp.requireLogin && !userLoggedIn ? null : (
          <HomeLinkCard {...subApp} />
        );
      })}
    </div>
  );
};

export default Home;
