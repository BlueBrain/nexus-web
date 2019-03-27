import * as React from 'react';
import { Card } from 'antd';
import { ProjectCardProps } from './ProjectCard';
import './Projects.less';
import AnimatedInfiniteScrollList from '../Animations/AnimatedInfiniteScrollList';
import ListCard from '../Animations/ListCardComponent';

export interface ProjectListProps {
  activeOrg: string;
  projects: ProjectCardProps[];
  busy?: boolean;
  onProjectClick?(label: string): void;
  onProjectEdit?(label: string): void;
  paginationSettings?: { total: number; from: number; pageSize: number };
  onPaginationChange?: (page: number, pageSize?: number) => void;
}

const ProjectList: React.FunctionComponent<ProjectListProps> = ({
  activeOrg,
  projects,
  busy = false,
  onProjectClick = () => {},
  onProjectEdit = () => {},
  paginationSettings,
  onPaginationChange,
}) => {
  return (
    <div className="projects-list">
      {paginationSettings && paginationSettings.total && (
        <p className="result">{`Found ${paginationSettings.total} Project${
          paginationSettings.total > 1 ? 's' : ''
        }`}</p>
      )}
      <AnimatedInfiniteScrollList
        refreshValue={activeOrg}
        itemComponent={(project, i) => (
          <ListCard
            key={project.label + i}
            {...project}
            onClick={() => onProjectClick(project.label)}
            onEdit={() => onProjectEdit(project.label)}
          />
        )}
        onPaginationChange={onPaginationChange}
        makeKey={item => item.id}
        loading={busy}
        results={projects}
        total={
          (paginationSettings && paginationSettings.total) || projects.length
        }
        paginationSettings={
          paginationSettings && {
            from: paginationSettings.from,
            total: paginationSettings.total,
            pageSize: paginationSettings.pageSize,
          }
        }
      />
    </div>
  );
};

export default ProjectList;
