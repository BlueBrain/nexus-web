import './ProjectsListView.scss';

import { ProjectResponseCommon } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '../../../shared/store/reducers';
import NewProjectContainer from '../containers/NewProjectContainer';
import ProjectsListContainer from '../containers/ProjectsListContainer';
import { userOrgLabel } from '../utils';

const MAX_PROJECTS = 300;

const ProjectsListView: React.FC<{}> = () => {
  const nexus = useNexusContext();

  const [personalProjects, setPersonalProjects] = React.useState<ProjectResponseCommon[]>();
  const [sharedProjects, setSharedProjects] = React.useState<ProjectResponseCommon[]>();
  const [archivedProjects, setArchivedProjects] = React.useState<ProjectResponseCommon[]>();

  const userName = useSelector((state: RootState) => state.oidc.user?.profile.preferred_username);

  const identities = useSelector((state: RootState) => state.auth.identities);

  const authenticatedIdentity = identities?.data?.identities.find((i) => {
    return i['@type'] === 'Authenticated';
  });

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    const personalOrg = userOrgLabel(authenticatedIdentity?.realm, userName);
    // TODO: Implement pagination.
    nexus.Project.list(personalOrg, {
      size: MAX_PROJECTS,
      deprecated: false,
    }).then((value) => {
      setPersonalProjects(value._results);
    });

    // TODO: Implement pagination.
    nexus.Project.list(undefined, {
      size: MAX_PROJECTS,
      deprecated: false,
    }).then((value) => {
      const shared = value._results.filter((v: ProjectResponseCommon) => {
        return v._organizationLabel !== personalOrg;
      });
      setSharedProjects(shared);
    });

    // TODO: Implement pagination.
    nexus.Project.list(undefined, {
      size: MAX_PROJECTS,
      deprecated: true,
    }).then((value) => {
      setArchivedProjects(value._results);
    });
  };

  const refreshLists = () => {
    fetchProjects();
  };

  return (
    <div className="view-container projects-subapp-container">
      <div>
        <NewProjectContainer onSuccess={refreshLists} />
        {personalProjects ? (
          <ProjectsListContainer projectType="Personal Projects" projects={personalProjects} />
        ) : null}
        {sharedProjects ? (
          <ProjectsListContainer projectType="Shared Projects" projects={sharedProjects} />
        ) : null}
        {archivedProjects ? (
          <ProjectsListContainer projectType="Archived Projects" projects={archivedProjects} />
        ) : null}
      </div>
    </div>
  );
};

export default ProjectsListView;
