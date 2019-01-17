import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import Lists from '../components/Lists';
import { getProp } from '../utils';
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
  console.log("i'm updating only once, yeah?");
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
      state.nexus.project &&
      state.nexus.project.data &&
      state.nexus.project.data.label) ||
    '',
  activeOrg:
    (state.nexus &&
      state.nexus.activeOrg &&
      state.nexus.activeOrg.org &&
      state.nexus.activeOrg.org.label) ||
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
