import * as React from 'react';

import StatusIcon from './StatusIcon';

import './ProjectCard.less';

const arrowIcon = require('../../../shared/images/arrow.svg');
const editIcon = require('../../../shared/images/pencil.svg');

type ProjectCardProps = {
  name: string;
  description: string;
  activitiesNumber: number;
  status: string;
  collaboratorsNumber: number;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  activitiesNumber,
  collaboratorsNumber,
  status,
}) => {
  const onClickEditButton = () => {
    console.log('clicked Edit project');
  };

  return (
    <div className="project-card">
      <div className="card-section">
        <StatusIcon status={status} />
      </div>
      <div className="card-section">
        <div className="title-container">
          <span className="name">{name}</span>
          <button className="edit-button" onClick={onClickEditButton}>
            <img src={editIcon} />
          </button>
        </div>
        <p className="description">{description}</p>
        <p></p>
      </div>
      <div className="card-section stats">
        <p>{activitiesNumber} activities</p>
        <p>{collaboratorsNumber} collaborators</p>
        <p>Status: {status}</p>
      </div>
      <div className="card-section">
        <a href="" className="arrow-icon">
          <img src={arrowIcon} />
        </a>
      </div>
    </div>
  );
};

export default ProjectCard;
