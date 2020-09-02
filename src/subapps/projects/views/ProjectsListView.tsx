import * as React from 'react';
import { useSelector } from 'react-redux';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { ProjectList, Project, ProjectResponseCommon } from '@bbp/nexus-sdk';
import ProjectCard from '../components/ProjectCard';
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

  const userName = useSelector(
    (state: RootState) => state.oidc.user?.profile.preferred_username
  );

  React.useEffect(() => {
    const personalOrg = `fusion-${userName}`;
    // TODO: Implement pagination.
    nexus.Project.list(personalOrg).then(value => {
      setPersonalProjects(value._results);
    });

    // TODO: Implement pagination.
    nexus.Project.list(undefined, {
      size: 1000,
    }).then(value => {
      const shared = value._results.filter((v: ProjectResponseCommon) => {
        return v._organizationLabel !== personalOrg;
      });
      setSharedProjects(shared);
    });
  }, []);
  return (
    <div className="view-container projects-subapp-container">
      <div className={'list-container'}>
        <NewProjectContainer />
        <div>
          <h1>Personal Projects</h1>
          {personalProjects
            ? personalProjects.map(v => {
                return (
                  <div className={'project-container'}>
                    <ProjectCard
                      name={v._label}
                      description={v.description ? v.description : ''}
                      activitiesNumber={9}
                      collaboratorsNumber={5}
                      status="In progress"
                    />
                  </div>
                );
              })
            : null}
        </div>
        <div>
          <h1>Shared Projects</h1>
          {sharedProjects
            ? sharedProjects.map(v => {
                return (
                  <div className={'project-container'}>
                    <ProjectCard
                      name={v._label}
                      description={v.description || ''}
                      activitiesNumber={9}
                      collaboratorsNumber={5}
                      status="In progress"
                    />
                  </div>
                );
              })
            : null}
        </div>
      </div>
    </div>
  );
};

export default ProjectsListView;
