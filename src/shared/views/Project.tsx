import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import Lists from '../components/Lists';

interface ProjectViewProps {
  orgLabel: string;
  projectLabel: string;
}

const ProjectView: React.FunctionComponent<ProjectViewProps> = ({
  orgLabel,
  projectLabel,
}) => {
  return (
    <div className="project">
      <Lists orgLabel={orgLabel} projectLabel={projectLabel} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  orgLabel:
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.org.label) ||
    '',
  projectLabel:
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.project.label) ||
    '',
});

export default connect(mapStateToProps)(ProjectView);
