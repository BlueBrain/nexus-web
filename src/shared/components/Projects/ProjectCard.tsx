import * as React from 'react';
import { Avatar, Button, Card } from 'antd';

import './Projects.less';

export interface ProjectCardProps {
  name: string;
  label: string;
  resourceNumber: number;
  logo?: string;
  onClick?(): void;
  onEdit?(): void;
}

const ProjectCard: React.FunctionComponent<ProjectCardProps> = ({
  name,
  label,
  resourceNumber,
  onEdit,
  onClick = () => {},
}) => {
  return (
    <Card className={`ProjectCard ${label}`} tabIndex={1} onClick={onClick}>
      <div className="content">
        <p className="project-name">{name}</p>
        <p className="project-number">
          <span className="number">{resourceNumber}</span> resource
          {resourceNumber > 1 && 's'}
        </p>
        {onEdit && (
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

export default ProjectCard;
