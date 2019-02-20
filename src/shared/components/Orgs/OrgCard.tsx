import * as React from 'react';
import { Avatar, Button, Card, Tag } from 'antd';

import './Orgs.less';

export interface OrgCardProps {
  label: string;
  projectNumber?: number;
  description?: string;
  logo?: string;
  deprecated?: boolean;
  onClick?(): void;
  onEdit?(): void;
}

const OrgCard: React.FunctionComponent<OrgCardProps> = ({
  label,
  projectNumber = 0,
  description = '',
  logo = '',
  deprecated = false,
  onClick = () => {},
  onEdit = () => {},
}) => {
  return (
    <Card className="OrgCard" tabIndex={1} onClick={onClick} bordered={false}>
      <div className="content">
        <div className="logo">
          <Avatar shape="square" size={32} icon="team" src={logo} />
        </div>
        <p className="org-name">{label}</p>
        {deprecated && <Tag color="red">deprecated</Tag>}
        <p className="project-number">
          <span className="number">{projectNumber}</span> project
          {projectNumber > 1 && 's'}
        </p>
        {!deprecated && onEdit && (
          <Button
            className="edit-button"
            type="primary"
            tabIndex={1}
            onClick={(e: React.SyntheticEvent) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            Edit
          </Button>
        )}
      </div>
      {description && <p className="org-description">{description}</p>}
    </Card>
  );
};

export default OrgCard;
