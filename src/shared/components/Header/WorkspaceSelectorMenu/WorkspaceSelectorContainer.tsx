import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../../store/reducers';
import WorkspaceSelectorMenuButton from './WorkspaceSelectorMenuButton';
import { Organization, Project } from '@bbp/nexus-sdk';

export interface WorkspaceSelectorContainerProps {
  activeOrg: Organization | null;
  activeProject: Project | null;
  displayPerPage: number;
}

const WorkspaceSelectorContainer: React.FunctionComponent<
  WorkspaceSelectorContainerProps
> = ({ children, ...props }) => <WorkspaceSelectorMenuButton {...props} />;

const mapStateToProps = (state: RootState) => ({
  displayPerPage: state.uiSettings.pageSizes.projectsListPageSize,
  activeOrg:
    (state.nexus &&
      state.nexus.activeOrg &&
      state.nexus.activeOrg.data &&
      state.nexus.activeOrg.data &&
      state.nexus.activeOrg.data.org) ||
    null,
  activeProject:
    (state.nexus &&
      state.nexus.activeProject &&
      state.nexus.activeProject.data) ||
    null,
});

const mapDispatchToProps = (dispatch: any) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkspaceSelectorContainer);
