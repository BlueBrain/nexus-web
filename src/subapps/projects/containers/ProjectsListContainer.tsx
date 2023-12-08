import {
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { ProjectResponseCommon } from '@bbp/nexus-sdk/es';
import { AccessControl } from '@bbp/react-nexus';
import { Button } from 'antd';
import * as React from 'react';

import ProjectCard from '../components/ProjectCard';
import ProjectMetaContainer from '../containers/ProjectMetaContainer';
import { Status } from '../types';

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
          icon={
            sortOrder === 'ASC' ? (
              <SortAscendingOutlined />
            ) : (
              <SortDescendingOutlined />
            )
          }
        />
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
          const { _organizationLabel, _label, description } = project;

          return (
            <AccessControl
              path={`/${_organizationLabel}/${_label}`}
              permissions={['projects/write', 'projects/read']}
              key={`project-${_organizationLabel}-${_label}`}
            >
              <div className="list-container">
                <div className="project-card-container">
                  <ProjectCard
                    key={`project-card-${_label}`}
                    name={_label}
                    orgLabel={_organizationLabel}
                    description={description || ''}
                    status={Status.inProgress}
                    onClickEdit={() =>
                      onClickEditProject(_organizationLabel, _label)
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
