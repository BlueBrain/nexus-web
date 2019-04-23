import * as React from 'react';
import { connect } from 'react-redux';
import {
  Organization,
  Project,
  Resource,
  PaginationSettings,
} from '@bbp/nexus-sdk';
import { RootState } from '../../../store/reducers';
import { List } from '../../../store/reducers/lists';
import { push } from 'connected-react-router';
import {
  updateList,
  deleteList,
  cloneList,
  makeOrgProjectFilterKey,
  initializeProjectList,
  createList,
} from '../../../store/actions/lists';
import QueriesBoard from './QueriesBoard';
import {
  queryResources,
  FilterQuery,
} from '../../../store/actions/queryResource';

export interface QueriesContainerProps {
  org: Organization;
  project: Project;
  lists: List[];
  initialize: VoidFunction;
  goToResource: (resource: Resource) => void;
  updateList: (listIndex: number, list: List) => void;
  deleteList: (listIndex: number) => void;
  cloneList: (listIndex: number, list: List) => void;
  createList: () => void;
  queryResources: (
    id: string,
    paginationSettings: PaginationSettings,
    query?: FilterQuery
  ) => void;
}

const QueriesContainer: React.FunctionComponent<
  QueriesContainerProps
> = props => {
  const { initialize, lists } = props;

  // If there are no query lists present,
  // let's set up this project workspace with a default one!
  React.useEffect(() => {
    if (!lists.length) {
      initialize();
    }
  }, []);

  return <QueriesBoard {...props} />;
};

const mapStateToProps = (
  state: RootState,
  { org, project }: { org: Organization; project: Project }
) => {
  const projectLists =
    (state.lists && state.lists[makeOrgProjectFilterKey(org, project)]) || [];
  return {
    displayPerPage: state.uiSettings.pageSizes.resourcesListPageSize,
    lists: projectLists,
  };
};

const mapDispatchToProps = (
  dispatch: any,
  { org, project }: { org: Organization; project: Project }
) => ({
  goToResource: (resource: Resource) =>
    dispatch(
      push(
        `/${org.label}/${project.label}/resources/${encodeURIComponent(
          resource.id
        )}`
      )
    ),
  createList: () => dispatch(createList(makeOrgProjectFilterKey(org, project))),
  updateList: (listIndex: number, list: List) =>
    dispatch(
      updateList(makeOrgProjectFilterKey(org, project), listIndex, list)
    ),
  deleteList: (listIndex: number) =>
    dispatch(deleteList(makeOrgProjectFilterKey(org, project), listIndex)),
  cloneList: (listIndex: number, list: List) =>
    dispatch(cloneList(makeOrgProjectFilterKey(org, project), listIndex, list)),
  initialize: () =>
    dispatch(initializeProjectList(makeOrgProjectFilterKey(org, project))),
  queryResources: (
    id: string,
    paginationSettings: PaginationSettings,
    query?: FilterQuery
  ) => dispatch(queryResources(id, org, project, paginationSettings, query)),
});

// TODO: move this at view level
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QueriesContainer);
