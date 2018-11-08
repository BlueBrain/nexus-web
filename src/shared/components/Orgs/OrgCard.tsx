import * as React from 'react';
import { Avatar, Button, Card } from 'antd';

import './Orgs.less';

export interface OrgCardProps {
  name: string;
  projectNumber: number;
  logo?: string;
  onEdit?: () => void;
}

const OrgCard: React.SFC<OrgCardProps> = ({
  name,
  projectNumber,
  logo = '',
  onEdit,
}) => {
  return (
    <Card className="OrgCard" tabIndex={1}>
      <div className="content">
        <div className="logo">
          <Avatar shape="square" size={32} icon="team" src={logo} />
        </div>
        <p className="org-name">{name}</p>
        <p className="project-number">
          <span className="number">{projectNumber}</span> project
          {projectNumber > 1 && 's'}
        </p>
        {onEdit && (
          <Button
            className="edit-button"
            type="primary"
            tabIndex={1}
            onClick={onEdit}
          >
            Edit
          </Button>
        )}
      </div>
    </Card>
  );
};

export default OrgCard;
