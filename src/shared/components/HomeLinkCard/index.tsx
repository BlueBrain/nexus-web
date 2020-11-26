import * as React from 'react';
import { Link } from 'react-router-dom';
import { Card } from 'antd';

import './HomeLinkCard.less';

const HomeLinkCard: React.FunctionComponent<{
  route: string;
  label: string;
  description?: string;
}> = ({ route, label, description }) => {
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
          <Meta title={label} description={description} />
        </Card>
      </Link>
    </div>
  );
};

export default HomeLinkCard;
