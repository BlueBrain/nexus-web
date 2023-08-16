import * as React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'antd';

import './HomeLinkCard.scss';

const HomeLinkCard: React.FunctionComponent<{
  route: string;
  label: string;
  description?: string;
  version?: string;
}> = ({ route, label, description, version }) => {
  const { Meta } = Card;

  return (
    <div className="home-link-card">
      <Link to={route}>
        <Card
          key={`subapp-card-${label}`}
          hoverable
          cover={
            <div
              className={`home-link-card__cover home-link-card__cover--${label}`}
            ></div>
          }
        >
          <Meta
            title={
              <span>
                {label} {<sup> {version}</sup>}
              </span>
            }
            description={description}
          />
        </Card>
      </Link>
    </div>
  );
};

export default HomeLinkCard;
