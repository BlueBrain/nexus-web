import * as React from 'react';
import { Status } from '../types';
import './ProjectCard.less';
declare type ProjectCardProps = {
  name: string;
  description: string;
  activitiesNumber?: number;
  status: Status;
  collaboratorsNumber?: number;
  orgLabel: string;
  onClickEdit(): void;
};
declare const ProjectCard: React.FC<ProjectCardProps>;
export default ProjectCard;
