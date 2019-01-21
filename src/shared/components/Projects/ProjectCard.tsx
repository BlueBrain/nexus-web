import * as React from 'react';
import { Button, Card, Tag } from 'antd';

import './Projects.less';

export interface ProjectCardProps {
  name: string;
  label: string;
  resourceNumber: number;
  deprecated?: boolean;
  logo?: string;
  onClick?(): void;
  onEdit?(): void;
}

const ProjectCard: React.FunctionComponent<ProjectCardProps> = ({
  name,
  label,
  resourceNumber,
  onEdit,
  deprecated = false,
  onClick = () => {},
}) => {
  return (
    <Card className={`ProjectCard ${label}`} tabIndex={1} onClick={onClick}>
      <div className="content">
        <p className="project-name">{name}</p>
        {deprecated && <Tag color="red">deprecated</Tag>}
        <p className="project-number">
          <span className="number">{resourceNumber}</span> resource
          {resourceNumber > 1 && 's'}
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

export default ProjectCard;
