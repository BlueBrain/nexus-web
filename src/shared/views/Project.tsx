import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import Lists from '../components/Lists';
import { fetchAndAssignProject } from '../store/actions/nexus/projects';
import { fetchOrg } from '../store/actions/nexus/activeOrg';
import { Project, Organization } from '@bbp/nexus-sdk';
import { Button, Empty } from 'antd';

interface ProjectViewProps {
  project: Project | null;
  match: any;
  fetchProject(org: string, project: string): void;
}

const ProjectView: React.FunctionComponent<ProjectViewProps> = ({
  match,
  project,
  fetchProject,
}) => {
  const projectLabel = project ? project.label : null;
  React.useEffect(
    () => {
      if (projectLabel !== match.params.project) {
        fetchProject(match.params.org, match.params.project);
      }
    },
    [match.params.project, match.params.org]
  );
  return (
    <div className="project">
      {!project && (
        <>
          <h1 style={{ marginBottom: 0, marginRight: 8 }}>
            {match.params.project}
          </h1>
          <Empty description="No project data found here..." />
        </>
      )}
      {project && (
        <>
          <div>
            <h1 style={{ marginBottom: 0, marginRight: 8 }}>{project.label}</h1>
            {project.description && <p>{project.description}</p>}{' '}
          </div>
          <Lists
            projectLabel={match.params.project}
            orgLabel={match.params.org}
          />
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  project:
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.data &&
      state.nexus.activeProject.data) ||
    null,
});
const mapDispatchToProps = (dispatch: any) => ({
  fetchProject: (org: string, project: string) => {
    dispatch(fetchOrg(org));
    dispatch(fetchAndAssignProject(org, project));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectView);
