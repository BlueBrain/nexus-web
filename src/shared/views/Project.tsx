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
  projectLabel: getProp(state, 'nexus.project.data.project.label'),
  orgLabel: getProp(state, 'nexus.activeOrg.label'),
});

const mapDispatchToProps = (dispatch: any) => ({
  fetchProject: (org: string, project: string) =>
    dispatch(fetchAndAssignProject(org, project)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ProjectView);
