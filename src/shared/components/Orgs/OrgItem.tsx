import * as React from 'react';
import { Button } from 'antd';
import { AccessControl } from '@bbp/react-nexus';
import ListItem from '../Animations/ListItem';

export interface OrgItemProps {
  label: string;
  description?: string;
  numProjects?: number;
  onClick?(): void;
  onEdit?(): void;
}

const OrgItem: React.FunctionComponent<OrgItemProps> = ({
  label,
  description,
  numProjects,
  onClick = () => {},
  onEdit = () => {},
}) => {
  return (
    <ListItem
      onClick={onClick}
      key={label}
      id={label}
      label={label}
      description={description}
      details={
        !!numProjects ? (
          <p className="project-number">
            <span className="number">{numProjects}</span> project
            {numProjects > 1 && 's'}
          </p>
        ) : null
      }
      action={
        onEdit ? (
          <AccessControl
            path={`/${label}`}
            permissions={['organizations/write']}
          >
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
          </AccessControl>
        ) : null
      }
    />
  );
};

export default OrgItem;
