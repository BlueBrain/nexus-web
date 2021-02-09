import * as React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';
import StatusIcon, { Status } from './StatusIcon';

import './ProjectCard.less';

const arrowIcon = require('../../../shared/images/arrow.svg');
const editIcon = require('../../../shared/images/pencil.svg');

type ProjectCardProps = {
  name: string;
  description: string;
  activitiesNumber?: number;
  status: Status;
  collaboratorsNumber?: number;
  orgLabel: string;
  onClickEdit(): void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  activitiesNumber,
  collaboratorsNumber,
  status,
  orgLabel,
  onClickEdit,
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
          <p>
            Organization: <span className="org">{orgLabel}</span>
          </p>
          <div className="title-container">
            <span className="name">{name}</span>
            <button className="edit-button" onClick={onClickEdit}>
              <img src={editIcon} />
            </button>
          </div>
          <p className="description">{description}</p>
        </div>
        {activitiesNumber || collaboratorsNumber ? (
          <div className="stats">
            <p>{activitiesNumber} activities</p>
            <p>{collaboratorsNumber} collaborators</p>
          </div>
        ) : null}
      </div>
      <div className="card-section arrow">
        <Link to={`/workflow/${orgLabel}/${name}`}>
          <img src={arrowIcon} />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
