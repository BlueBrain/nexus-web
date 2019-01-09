import * as React from 'react';
import { Input } from 'antd';
import ProjectCard, { ProjectCardProps } from './ProjectCard';

import './Projects.less';

export interface ProjectListProps {
  projects: ProjectCardProps[];
  onProjectClick?(label: string): void;
  onProjectEdit?(label: string): void;
}

const Search = Input.Search;

const ProjectList: React.FunctionComponent<ProjectListProps> = ({
  projects,
  onProjectClick = () => {},
  onProjectEdit = () => {},
}) => {
  const [items, setItems] = React.useState(projects);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = projects.filter(project =>
      project.name
        .toLocaleLowerCase()
        .includes(e.target.value.toLocaleLowerCase())
    );
    setItems(filtered);
  };

  return (
    <div className="ProjectList">
      <Search
        className="filter"
        placeholder="Filter by name"
        onChange={handleChange}
      />
      <p className="result">
        Found {items.length} project{items.length > 1 && 's'}
      </p>
      <div className="projects">
        {items.map((project, i) => (
          <ProjectCard
            key={project.name + i}
            {...project}
            onClick={() => onProjectClick(project.label)}
            onEdit={() => onProjectEdit(project.label)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
