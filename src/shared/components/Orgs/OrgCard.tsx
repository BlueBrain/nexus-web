import * as React from 'react';
import { Avatar, Button, Card, Tag } from 'antd';

import './Orgs.less';

export interface OrgCardProps {
  label: string;
  name: string;
  projectNumber: number;
  logo?: string;
  deprecated?: boolean;
  onClick?(): void;
  onEdit?(): void;
}

const OrgCard: React.FunctionComponent<OrgCardProps> = ({
  name,
  projectNumber,
  logo = '',
  deprecated = false,
  onClick = () => {},
  onEdit = () => {},
}) => {
  return (
    <Card className="OrgCard" tabIndex={1} onClick={onClick}>
      <div className="content">
        <div className="logo">
          <Avatar shape="square" size={32} icon="team" src={logo} />
        </div>
        <p className="org-name">{name}</p>
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
    </Card>
  );
};

export default OrgCard;
