import * as React from 'react';
import { Button, Card, Tag } from 'antd';

import './Projects.less';
import { AccessControl } from '@bbp/react-nexus';

export interface ProjectCardProps {
  label: string;
  orgLabel: string;
  deprecated?: boolean;
  description?: string;
  logo?: string;
  onClick?(): void;
  onEdit?(): void;
}

const ProjectCard: React.FunctionComponent<ProjectCardProps> = ({
  label,
  orgLabel,
  description = '',
  onEdit,
  deprecated = false,
  onClick = () => {},
}) => {
  return (
    <Card className={`ProjectCard ${label}`} tabIndex={1} onClick={onClick}>
      <div className="content">
        <p className="project-name">{label}</p>
        {deprecated && <Tag color="red">deprecated</Tag>}
        {!deprecated && onEdit && (
          <AccessControl
            path={`/${orgLabel}/${label}`}
            permissions={['projects/write']}
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
        )}
      </div>
      {description && <p className="project-description">{description}</p>}
    </Card>
  );
};

export default ProjectCard;
