import * as React from 'react';
import { useSelector } from 'react-redux';
import { useNexusContext } from '@bbp/react-nexus';
import { ProjectResponseCommon } from '@bbp/nexus-sdk';
import ProjectCard from '../components/ProjectCard';
import ProjectsListContainer from '../containers/ProjectsListContainer';
import NewProjectContainer from '../containers/NewProjectContainer';
import { RootState } from '../../../shared/store/reducers';
import './ProjectsListView.less';

const ProjectsListView: React.FC<{}> = () => {
  const nexus = useNexusContext();

  const [personalProjects, setPersonalProjects] = React.useState<
    ProjectResponseCommon[]
  >();
  const [sharedProjects, setSharedProjects] = React.useState<
    ProjectResponseCommon[]
  >();
  const [archivedProjects, setArchivedProjects] = React.useState<
    ProjectResponseCommon[]
  >();

  const userName = useSelector(
    (state: RootState) => state.oidc.user?.profile.preferred_username
  );

  React.useEffect(() => {
    const personalOrg = `fusion-${userName}`;
    // TODO: Implement pagination.
    nexus.Project.list(personalOrg, {
      size: 1000,
      deprecated: false,
    }).then(value => {
      setPersonalProjects(value._results);
    });

    // TODO: Implement pagination.
    nexus.Project.list(undefined, {
      size: 1000,
      deprecated: false,
    }).then(value => {
      const shared = value._results.filter((v: ProjectResponseCommon) => {
        return v._organizationLabel !== personalOrg;
      });
      setSharedProjects(shared);
    });

    // TODO: Implement pagination.
    nexus.Project.list(undefined, {
      size: 1000,
      deprecated: true,
    }).then(value => {
      setArchivedProjects(value._results);
    });
  }, []);
  return (
    <div className="view-container projects-subapp-container">
      <div>
        <NewProjectContainer />
        {personalProjects ? (
          <ProjectsListContainer
            projectType="Personal Projects"
            projects={personalProjects}
          />
        ) : null}
        {sharedProjects ? (
          <ProjectsListContainer
            projectType="Shared Projects"
            projects={sharedProjects}
          />
        ) : null}
        {archivedProjects ? (
          <ProjectsListContainer
            projectType="Archived Projects"
            projects={archivedProjects}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ProjectsListView;
