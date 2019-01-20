import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import Lists from '../components/Lists';
import { fetchAndAssignProject } from '../store/actions/nexus/projects';

interface ProjectViewProps {
  projectLabel: string;
  orgLabel: string;
  match: any;
  fetchProject(org: string, project: string): void;
}

const ProjectView: React.FunctionComponent<ProjectViewProps> = ({
  match,
  projectLabel,
  orgLabel,
  fetchProject,
}) => {
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
      <Lists projectLabel={match.params.project} orgLabel={match.params.org} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  projectLabel:
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.data &&
      state.nexus.activeProject.data.label) ||
    '',
  activeOrg:
    (state.nexus &&
      state.nexus.activeOrg &&
      state.nexus.activeOrg.org &&
      state.nexus.activeOrg.org.data &&
      state.nexus.activeOrg.org.data.label) ||
    '',
});
const mapDispatchToProps = (dispatch: any) => ({
  fetchProject: (org: string, project: string) =>
    dispatch(fetchAndAssignProject(org, project)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectView);
