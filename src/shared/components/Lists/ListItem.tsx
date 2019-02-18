import * as React from 'react';
import { PaginationSettings } from '@bbp/nexus-sdk';
import { connect } from 'react-redux';
import { List } from '../../store/reducers/lists';
import Renameable from '../Renameable';
import { RootState } from '../../store/reducers';
import { Icon, Empty, Spin } from 'antd';
import ResourceList from '../Resources/ResourceList';
import { updateList, deleteList, cloneList } from '../../store/actions/lists';
import { queryResources, makeESQuery } from '../../store/actions/queryResource';
import ListControlPanel from './ListControlPanel';

interface ListItemContainerProps {
  list: List;
  listIndex: number;
  orgProjectFilterKey: string;
  orgLabel: string;
  displayPerPage: number;
  projectLabel: string;
  updateList: (listIndex: number, list: List) => void;
  deleteList: (listIndex: number) => void;
  cloneList: () => void;
  queryResources: (paginationSettings: PaginationSettings, query?: any) => void;
}

const ListItemContainer: React.FunctionComponent<ListItemContainerProps> = ({
  list,
  listIndex,
  updateList,
  deleteList,
  cloneList,
  orgLabel,
  projectLabel,
  queryResources,
  displayPerPage,
}) => {
  const DEFAULT_PAGINATION_SETTINGS = {
    from: 0,
    size: displayPerPage,
  };
  React.useEffect(
    () => {
      const {
        request: { isFetching, data, error },
      } = list;
      const paginationSettings = data
        ? data.paginationSettings
        : DEFAULT_PAGINATION_SETTINGS;
      if (!data && !isFetching && !error) {
        // Or when query changes
        queryResources(paginationSettings);
      }
    },
    [list.query]
  );
  const {
    name,
    request: { isFetching, data, error },
    query,
  } = list;

  const handleUpdate = (value: string) => {
    updateList(listIndex, { ...list, name: value });
  };

  const handleDelete = () => {
    deleteList(listIndex);
  };

  const handlePaginationChange = (page: number, size: number) => {
    // NOTE: page begins from 1, not 0.
    // from is the total number of resources beggining from 0, not the page number!
    queryResources({ size, from: page * size - size });
  };

  const handleTextQueryChange = (value?: string) => {
    if (data) {
      queryResources(data.paginationSettings, {
        filters: query.filters,
        textQuery: value,
      });
    }
  };

  const handleFilterUpdate = (value: any) => {
    if (data) {
      queryResources(data.paginationSettings, {
        filters: { ...query.filters, ...value },
        textQuery: query.textQuery,
      });
    }
  };

  const handleClearFilter = () => {
    queryResources(
      data ? data.paginationSettings : DEFAULT_PAGINATION_SETTINGS
    );
  };

  const handleListRefresh = () => {
    handleFilterUpdate({});
  };

  const filterValues = data
    ? { _constrainedBy: data['_constrainedBy'], '@type': data['@type'] }
    : {};

  return (
    <div style={{ height: '100%' }}>
      <h3
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: 'rgba(0, 0, 0, 0.65',
        }}
      >
        <Renameable defaultValue={name} onChange={handleUpdate} size="small" />
        <Icon type="close" className="close-button" onClick={handleDelete} />
      </h3>
      <ListControlPanel
        listIndex={listIndex}
        query={query}
        filterValues={filterValues}
        onTextQueryChange={handleTextQueryChange}
        onFilterChange={handleFilterUpdate}
        onRefreshList={handleListRefresh}
        onClear={handleClearFilter}
        onCloneList={cloneList}
        queryPath={`/${orgLabel}/${projectLabel}/${
          list.view
        }/_search?query=${JSON.stringify(makeESQuery(query))}`}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50%',
        }}
      >
        {!data && (
          <Spin spinning={isFetching}>
            {error && (
              <Empty
                description={<span>There was an error loading this data.</span>}
              />
            )}
          </Spin>
        )}
        {data && (
          <ResourceList
            loading={isFetching}
            paginationSettings={{
              total: data.resources.results.length,
              pageSize: 20,
              ...data.paginationSettings,
            }}
            paginationChange={handlePaginationChange}
            resources={data.resources}
          />
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  displayPerPage: state.uiSettings.pageSizes.resourcesListPageSize,
});

const mapDispatchToProps = (
  dispatch: any,
  { orgProjectFilterKey, orgLabel, projectLabel, listIndex, list }: any
) => ({
  updateList: (listIndex: number, list: List) =>
    dispatch(updateList(orgProjectFilterKey, listIndex, list)),
  deleteList: (listIndex: number) =>
    dispatch(deleteList(orgProjectFilterKey, listIndex)),
  cloneList: () => dispatch(cloneList(orgProjectFilterKey, listIndex, list)),
  queryResources: (paginationSettings: PaginationSettings, query?: any) =>
    dispatch(
      queryResources(
        listIndex,
        orgProjectFilterKey,
        orgLabel,
        projectLabel,
        paginationSettings,
        query
      )
    ),
});

// TODO: move this at view level
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ListItemContainer);
