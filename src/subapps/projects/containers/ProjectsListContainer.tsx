import * as React from 'react';
import { Icon, Button } from 'antd';
import { ProjectResponseCommon } from '@bbp/nexus-sdk';

import ProjectMetaContainer from '../containers/ProjectMetaContainer';
import ProjectCard from '../components/ProjectCard';
import { Status } from '../components/StatusIcon';

type ProjectsListContainerType = {
  projects: ProjectResponseCommon[];
  projectType: string;
};
const ProjectsListContainer: React.FC<ProjectsListContainerType> = ({
  projects,
  projectType,
}) => {
  const [sortOrder, setSortOrder] = React.useState<string>('ASC');
  const [
    { selectedOrg, selectedProject },
    setSelectedProject,
  ] = React.useState<{
    selectedOrg: string | null;
    selectedProject: string | null;
  }>({
    selectedOrg: null,
    selectedProject: null,
  });

  const onClickEditProject = (orgLabel: string, projectLabel: string) => {
    setSelectedProject({
      selectedOrg: orgLabel,
      selectedProject: projectLabel,
    });
  };

  const closeMetadataForm = () => {
    setSelectedProject({
      selectedOrg: null,
      selectedProject: null,
    });
  };

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
            <div
              className="list-container"
              key={`project-${v._organizationLabel}-${v._label}`}
            >
              <div className="project-card-container">
                <ProjectCard
                  key={`project-card-${v._label}`}
                  name={v._label}
                  orgLabel={v._organizationLabel}
                  description={v.description || ''}
                  activitiesNumber={9}
                  collaboratorsNumber={5}
                  status={Status.inProgress}
                  onClickEdit={() =>
                    onClickEditProject(v._organizationLabel, v._label)
                  }
                />
              </div>
            </div>
          );
        })}
      {selectedOrg && selectedProject && (
        <ProjectMetaContainer
          orgLabel={selectedOrg}
          projectLabel={selectedProject}
          onClose={closeMetadataForm}
        />
      )}
    </div>
  );
};

export default ProjectsListContainer;
