import * as React from 'react';
import { Icon, Button } from 'antd';
import { ProjectResponseCommon } from '@bbp/nexus-sdk';
import ProjectCard from '../components/ProjectCard';

type ProjectsListContainerType = {
  projects: ProjectResponseCommon[];
  projectType: string;
};
const ProjectsListContainer: React.FC<ProjectsListContainerType> = ({
  projects,
  projectType,
}) => {
  const [sortOrder, setSortOrder] = React.useState<string>('ASC');
  return (
    <div>
      <div className="list-header">
        <h1>{projectType}</h1>
        <Button
          size="small"
          className={'sort-button'}
          onClick={() => {
            sortOrder === 'DSC' ? setSortOrder('ASC') : setSortOrder('DSC');
          }}
        >
          {sortOrder === 'ASC' ? <Icon type="up" /> : <Icon type="down" />}
        </Button>
      </div>
      {projects
        .sort((v1, v2) => {
          if (sortOrder === 'ASC') {
            return v1._label.toLocaleUpperCase() > v2._label.toLocaleUpperCase()
              ? 1
              : -1;
          }
          return v1._label.toLocaleUpperCase() < v2._label.toLocaleUpperCase()
            ? 1
            : -1;
        })
        .map((v: ProjectResponseCommon) => {
          return (
            <div className="list-container">
              <div className="project-container">
                <ProjectCard
                  name={v._label}
                  description={v.description || ''}
                  activitiesNumber={9}
                  collaboratorsNumber={5}
                  status="In progress"
                />
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default ProjectsListContainer;
