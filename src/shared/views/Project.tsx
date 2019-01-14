import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../store/reducers';
import Lists from '../components/Lists';
import { getProp } from '../utils';

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
  orgLabel: getProp(state, 'nexus.project.data.orgLabel'),
  projectLabel: getProp(state, 'nexus.project.data.label'),
});

export default connect(mapStateToProps)(ProjectView);
