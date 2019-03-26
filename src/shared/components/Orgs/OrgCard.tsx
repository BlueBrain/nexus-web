import * as React from 'react';
import { Button, Tag } from 'antd';

import './list-card.less';

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
    <div className="list-card -compact" tabIndex={1} onClick={onClick}>
      <div className="content">
        <span className="label">{label}</span>
        <p className="detail">
          {deprecated && <Tag color="red">deprecated</Tag>}
          <span className="number">{projectNumber.toLocaleString()}</span>{' '}
          project
          {projectNumber > 1 && 's'}
        </p>
        {!deprecated && onEdit && (
          <div className="actions">
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
          </div>
        )}
      </div>
      <div className="fade" />
      {description && <p className="description">{description}</p>}
    </div>
  );
};

export default OrgCard;
