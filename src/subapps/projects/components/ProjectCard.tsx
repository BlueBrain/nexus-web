import * as React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';
import StatusIcon, { Status } from './StatusIcon';
import ProjectMetaContainer from '../containers/ProjectMetaContainer';

import './ProjectCard.less';

const arrowIcon = require('../../../shared/images/arrow.svg');

type ProjectCardProps = {
  name: string;
  description: string;
  activitiesNumber: number;
  status: Status;
  collaboratorsNumber: number;
  orgLabel: string;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  activitiesNumber,
  collaboratorsNumber,
  status,
  orgLabel,
}) => {
  return (
    <div className="project-card">
      <Tooltip title={status}>
        <div className="card-section icon">
          <StatusIcon status={status} />
        </div>
      </Tooltip>
      <div className="card-section main">
        <div className="main-info">
          <div className="title-container">
            <span className="name">{name}</span>
            <ProjectMetaContainer
              orgLabel={orgLabel}
              projectLabel={name}
              showAsIcon
            />
          </div>
          <p className="description">{description}</p>
        </div>
        <div className="stats">
          <p>{activitiesNumber} activities</p>
          <p>{collaboratorsNumber} collaborators</p>
        </div>
      </div>
      <div className="card-section arrow">
        <Link to={`/projects/${orgLabel}/${name}`}>
          <img src={arrowIcon} />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
