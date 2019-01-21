import * as React from 'react';
import { PaginatedList, Resource, PaginationSettings } from '@bbp/nexus-sdk';
import { connect } from 'react-redux';
import { List } from '../../store/reducers/lists';
import Renameable from '../Renameable';
import { RootState } from '../../store/reducers';
import { Dropdown, Menu, Input, Icon, Button, Empty, Spin } from 'antd';
import ResourceList from '../Resources/ResourceList';
import { updateList, deleteList } from '../../store/actions/lists';
import { queryResources } from '../../store/actions/queryResource';
import ListControlPanel from './ListControlPanel';

interface ListItemContainerProps {
  list: List;
  listIndex: number;
  orgProjectFilterKey: string;
  updateList: (listIndex: number, list: List) => void;
  deleteList: (listIndex: number) => void;
  queryResources: (paginationSettings: PaginationSettings, query?: any) => void;
}

const DEFAULT_RESOURCE_PAGINATION_SIZE = 20;

const DEFAULT_PAGINATION_SETTINGS = {
  from: 0,
  size: DEFAULT_RESOURCE_PAGINATION_SIZE,
};

const ListItemContainer: React.FunctionComponent<ListItemContainerProps> = ({
  list,
  listIndex,
  updateList,
  deleteList,
  queryResources,
}) => {
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
        query={query}
        onTextQueryChange={handleTextQueryChange}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50%',
        }}
      >
        {error && (
          <Empty
            description={<span>There was an error loading this data.</span>}
          />
        )}
        {!data && isFetching && <Spin />}
        {data && (
          <ResourceList
            loading={isFetching}
            paginationSettings={data.paginationSettings}
            paginationChange={handlePaginationChange}
            resources={data.resources}
          />
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({});

const mapDispatchToProps = (
  dispatch: any,
  { orgProjectFilterKey, orgLabel, projectLabel, listIndex }: any
) => ({
  updateList: (listIndex: number, list: List) =>
    dispatch(updateList(orgProjectFilterKey, listIndex, list)),
  deleteList: (listIndex: number) =>
    dispatch(deleteList(orgProjectFilterKey, listIndex)),
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
