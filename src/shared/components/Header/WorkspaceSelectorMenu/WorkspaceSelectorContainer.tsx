import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../../store/reducers';
import WorkspaceSelectorMenuButton from './WorkspaceSelectorMenuButton';
import {
  Organization,
  Project,
  PaginationSettings,
  PaginatedList,
} from '@bbp/nexus-sdk';
import { fetchOrgs } from '../../../store/actions/nexus/orgs';
import { FetchableState } from '../../../store/reducers/utils';

export interface WorkspaceSelectorContainerProps {
  activeOrg: Organization | null;
  activeProject: Project | null;
  orgs: FetchableState<PaginatedList<Organization>>;
  fetchOrgs: (paginationSettings?: PaginationSettings) => void;
  selectOrg: (orgLabel: string) => void;
  selectProject: (projectLabel: string) => void;
  displayPerPage: number;
}

const WorkspaceSelectorContainer: React.FunctionComponent<
  WorkspaceSelectorContainerProps
> = ({ children, ...props }) => <WorkspaceSelectorMenuButton {...props} />;

const mapStateToProps = (state: RootState) => ({
  displayPerPage: state.uiSettings.pageSizes.projectsListPageSize,
  orgs: (state.nexus && state.nexus.orgs) || {
    isFetching: false,
    data: null,
    error: null,
  },
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

const mapDispatchToProps = (dispatch: any) => ({
  fetchOrgs: (paginationSettings?: PaginationSettings) =>
    dispatch(fetchOrgs(paginationSettings)),
  selectOrg: (orgLabel: string) => {},
  selectProject: (orgLabel: string) => {},
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkspaceSelectorContainer);
