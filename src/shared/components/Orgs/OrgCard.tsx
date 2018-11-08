import * as React from 'react';
import { Avatar, Card } from 'antd';

import './Orgs.less';

interface OrgCardProps {
  name: string;
  projectNumber: number;
  logo?: string;
}

const OrgCard: React.SFC<OrgCardProps> = ({
  name,
  projectNumber,
  logo = '',
}) => {
  return (
    <Card className="OrgCard">
      <div className="content">
        <div className="logo">
          <Avatar shape="square" size={64} icon="user" src={logo} />
        </div>
        <p className="org-name">{name}</p>
        <p className="project-number">
          {projectNumber} project{projectNumber > 1 && 's'}
        </p>
      </div>
    </Card>
  );
};

export default OrgCard;
