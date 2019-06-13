import * as React from 'react';
import { Input } from 'antd';
import ProjectCard, { ProjectCardProps } from './ProjectCard';
import AnimatedList from '../Animations/AnimatedList';

import './Projects.less';

export interface ProjectListProps {
  projects: ProjectCardProps[];
  busy?: boolean;
  onProjectClick?(label: string): void;
  onProjectEdit?(label: string): void;
  paginationSettings?: { total: number; from: number; pageSize: number };
  onPaginationChange?: (page: number, pageSize?: number) => void;
}

const Search = Input.Search;

const ProjectList: React.FunctionComponent<ProjectListProps> = ({
  projects,
  busy = false,
  onProjectClick = () => {},
  onProjectEdit = () => {},
  paginationSettings,
  onPaginationChange,
}) => {
  const [items, setItems] = React.useState(projects);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = projects.filter(project =>
      project.label
        .toLocaleLowerCase()
        .includes(e.target.value.toLocaleLowerCase())
    );
    setItems(filtered);
  };

  return (
    <div className="ProjectList">
      <AnimatedList
        itemComponent={(project, i) => (
          <ProjectCard
            key={project.label + i}
            {...project}
            onClick={() => onProjectClick(project.label)}
            onEdit={() => onProjectEdit(project.label)}
          />
        )}
        onPaginationChange={onPaginationChange}
        makeKey={item => item.label}
        itemName="Projects"
        loading={busy}
        results={items}
        total={(paginationSettings && paginationSettings.total) || items.length}
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
