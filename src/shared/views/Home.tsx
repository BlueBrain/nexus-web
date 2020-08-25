import * as React from 'react';
import { Card } from 'antd';
import { Link } from 'react-router-dom';

const { Meta } = Card;

const backgrounds = [
  'linear-gradient( 135deg, #90F7EC 10%, #32CCBC 100%)',
  'linear-gradient( 135deg, #CE9FFC 10%, #7367F0 100%)',
  'linear-gradient( 135deg, #928DAB 10%, #1F1C2C 100%)',
];

const style = {
  height: '1em',
  width: '100%',
};

const HomeLinkCard: React.FunctionComponent<{
  namespace: string;
  title: string;
  description: string;
  background: string;
}> = ({ namespace, title, description, background }) => {
  return (
    <Link to={namespace} style={{ margin: '1em', width: '400px' }}>
      <Card
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
  return (
    <div
      className="home-view view-container"
      style={{ display: 'flex', flexWrap: 'wrap' }}
    >
      {/* TODO: fetch this list from some subApp context */}
      {[
        {
          namespace: '/admin',
          title: 'Admin',
          description:
            'Manage, edit, and query your Nexus Delta knowledge graph',
          background: backgrounds[0],
        },
        {
          namespace: '/studios',
          title: 'Studios',
          description:
            'Visualize query results from Nexus Delta in customizable views',
          background: backgrounds[1],
        },
        {
          namespace: '/projects',
          title: 'Projects',
          description:
            'Visualize query results from Nexus Delta in customizable views',
          background: backgrounds[2],
        },
      ].map(HomeLinkCard)}
    </div>
  );
};

export default Home;
