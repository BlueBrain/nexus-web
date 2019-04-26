import * as React from 'react';
import { List } from '../../../../store/reducers/lists';
import './query-component.less';
import InfiniteScroll from '../../../Animations/InfiniteScroll';
import ListItem from '../../../Animations/ListItem';
import { FetchableState } from '../../../../store/reducers/utils';
import { PaginatedList, Resource } from '@bbp/nexus-sdk';
import ResourceMetadataCard from '../../../Resources/MetadataCard';
import { Popover, Icon, Input, Tooltip, Button, AutoComplete } from 'antd';
import TypesIconList from '../../../Types/TypesIcon';
import RenameableItem from '../../../Renameable';
import { Type } from '../../../Icons';
import { cloneList } from '../../../../store/actions/lists';
import FullTextSearch from './Search';

const MOUSE_ENTER_DELAY = 0.5;

interface QueryComponentProps {
  list: List;
  goToResource: (resource: Resource) => void;
  goToQuery: (list: List) => void;
  next: VoidFunction;
  updateList: (list: List) => void;
  deleteList: () => void;
  cloneList: (list: List) => void;
  handleRefreshList: () => void;
}

const QueryComponent: React.FunctionComponent<QueryComponentProps> = props => {
  const {
    list: {
      name,
      query,
      results: { error, isFetching, data },
    },
    handleRefreshList,
    goToResource,
    goToQuery,
    updateList,
    deleteList,
    cloneList,
    next,
  } = props;
  console.log({ props });
  const handleOnClick = (resource: Resource) => () => goToResource(resource);
  const handleUpdate = (value: string) => {
    updateList({ ...props.list, name: value });
  };
  const handleOnSearch = (value: string) => {
    // update TextQuery value
    updateList({
      ...props.list,
      query: {
        ...props.list.query,
        textQuery: value,
      },
    });
  };
  const handleDelete = () => {
    deleteList();
  };
  const handleClear = () => {
    // remove the filters
    // and the textQuery
    updateList({
      ...props.list,
      query: {
        filters: {},
      },
    });
  };

  const handleCloneList = () => {
    cloneList({ ...props.list });
  };

  const fetchablePaginatedList: FetchableState<PaginatedList<Resource>> = {
    error,
    isFetching,
    data: (data && data.resources) || null,
  };
  return (
    <div className="query-component">
      <h3 className="header">
        <RenameableItem
          defaultValue={`${name} ${isFetching ? 'loading' : ''}`}
          onChange={handleUpdate}
          size="small"
        />
        <div className="count">
          {fetchablePaginatedList.data &&
            !!fetchablePaginatedList.data.total &&
            `${fetchablePaginatedList.data.total} result${
              fetchablePaginatedList.data.total > 1 ? 's' : ''
            }`}
        </div>
        <Icon type="close" className="close-button" onClick={handleDelete} />
      </h3>
      <div className="controls">
        <FullTextSearch
          onSearch={handleOnSearch}
          value={query && query.textQuery}
        />
        <Tooltip title="Clear filters">
          <Button icon="close-circle" onClick={handleClear} />
        </Tooltip>
        <Tooltip title="Refresh list">
          <Button icon="reload" onClick={handleRefreshList} />
        </Tooltip>
        <Tooltip title="Clone this query">
          <Button icon="switcher" onClick={handleCloneList} />
        </Tooltip>
        <Tooltip title="View ElasticSearch query">
          <Button icon="search" onClick={() => goToQuery(props.list)} />
        </Tooltip>
        <AutoComplete>
          <Input suffix={Type} />
        </AutoComplete>
        <AutoComplete />
      </div>
      <InfiniteScroll
        makeKey={(resource: Resource) => resource.id}
        itemComponent={(resource: Resource, index: number) => {
          return (
            <div key={resource.id}>
              <Popover
                content={<ResourceMetadataCard {...resource} />}
                mouseEnterDelay={MOUSE_ENTER_DELAY}
                key={resource.id}
              >
                <ListItem
                  onClick={handleOnClick(resource)}
                  label={resource.name}
                  id={resource.id}
                  details={
                    resource.type && resource.type.length ? (
                      <TypesIconList type={resource.type} />
                    ) : (
                      undefined
                    )
                  }
                />
              </Popover>
            </div>
          );
        }}
        loadNextPage={next}
        fetchablePaginatedList={fetchablePaginatedList}
      />
    </div>
  );
};

export default QueryComponent;
