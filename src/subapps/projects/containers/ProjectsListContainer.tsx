import * as React from 'react';
import { Icon, Button } from 'antd';
import { ProjectResponseCommon } from '@bbp/nexus-sdk';
import { AccessControl } from '@bbp/react-nexus';

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
          {sortOrder === 'ASC' ? (
            <Icon type="sort-ascending" />
          ) : (
            <Icon type="sort-descending" />
          )}
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
        .map((project: ProjectResponseCommon) => {
          return (
            <AccessControl
              path={`/${project._organizationLabel}/${project._label}`}
              permissions={['projects/write', 'projects/read']}
              key={`project-${project._organizationLabel}-${project._label}`}
            >
              <div className="list-container">
                <div className="project-card-container">
                  <ProjectCard
                    key={`project-card-${project._label}`}
                    name={project._label}
                    orgLabel={project._organizationLabel}
                    description={project.description || ''}
                    activitiesNumber={9}
                    collaboratorsNumber={0}
                    status={Status.inProgress}
                    onClickEdit={() =>
                      onClickEditProject(
                        project._organizationLabel,
                        project._label
                      )
                    }
                  />
                </div>
              </div>
            </AccessControl>
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
