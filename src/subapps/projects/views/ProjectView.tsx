import * as React from 'react';
import { useProjectsSubappContext } from '..';
import ProjectHeader from '../components/ProjectHeader';
import { useRouteMatch } from 'react-router';
import './ProjectView.less';
import { useNexusContext } from '@bbp/react-nexus';
import { Project } from '@bbp/nexus-sdk';

const ProjectView: React.FC = () => {
  const subapp = useProjectsSubappContext();
  const match = useRouteMatch<{ orgLabel: string; projectLabel: string }>(
    `/${subapp.namespace}/:orgLabel/:projectLabel`
  );
  const [project, setProject] = React.useState<Project>();
  const [error, setError] = React.useState<Error>();
  const projectLabel = match?.params.projectLabel;
  const orgLabel = match?.params.orgLabel;
  const nexus = useNexusContext();
  React.useEffect(() => {
    if (orgLabel && projectLabel) {
      nexus.Project.get(orgLabel, projectLabel)
        .then((value: Project) => {
          setProject(value);
        })
        .catch(error => {
          setError(error);
        });
    }
  }, []);
  return (
    <>
      {project ? (
        <div className="project-container">
          <ProjectHeader name={project._label} />
        </div>
      ) : (
        'Project not found'
      )}
    </>
  );
};

export default ProjectView;
