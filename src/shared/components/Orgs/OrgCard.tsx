import * as React from 'react';
import { Button, Tag } from 'antd';

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
    <div className="list-card" tabIndex={1} onClick={onClick}>
      <div className="content">
        <span className="name">{label}</span>
        {deprecated && <Tag color="red">deprecated</Tag>}
        <p className="detail">
          <span className="number">{projectNumber.toLocaleString()}</span>{' '}
          project
          {projectNumber > 1 && 's'}
        </p>
        {!deprecated && onEdit && (
          <Button
            className="edit-button"
            type="primary"
            size="small"
            icon="edit"
            tabIndex={1}
            onClick={(e: React.SyntheticEvent) => {
              e.stopPropagation();
              onEdit();
            }}
          />
        )}
      </div>
      {description && <p className="description">{description}</p>}
    </div>
  );
};

export default OrgCard;
