import * as React from 'react';
import { List } from '../../../../store/reducers/lists';
import './query-component.less';
import InfiniteScroll from '../../../Animations/InfiniteScroll';
import ListItem from '../../../Animations/ListItem';
import { FetchableState } from '../../../../store/reducers/utils';
import { PaginatedList, Resource } from '@bbp/nexus-sdk';
import ResourceMetadataCard from '../../../Resources/MetadataCard';
import { Popover, Icon, Tooltip, Button, Spin } from 'antd';
import TypesIconList from '../../../Types/TypesIcon';
import RenameableItem from '../../../Renameable';
import FullTextSearch from './Search';
import TypesFilter from './Types';
import SchemasFilter from './Schemas';

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
  showSpinner: boolean;
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
    showSpinner,
  } = props;
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

  const handleFilterChange = (value: { [filterKey: string]: string }) => {
    updateList({
      ...props.list,
      query: {
        ...props.list.query,
        filters: {
          ...props.list.query.filters,
          ...value,
        },
      },
    });
  };

  const fetchablePaginatedList: FetchableState<PaginatedList<Resource>> = {
    error,
    isFetching,
    data: (data && data.resources) || null,
  };
  const total =
    (fetchablePaginatedList.data && fetchablePaginatedList.data.total) || 0;
  return (
    <div className="query-component">
      <h3 className="header">
        <RenameableItem
          defaultValue={`${name} ${isFetching ? 'loading' : ''}`}
          onChange={handleUpdate}
          size="small"
        />
        <div className="count">
          {total && `${total} result${total > 1 ? 's' : ''}`}
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
        <TypesFilter
          filters={query && query.filters}
          types={data && data.types}
          onChange={handleFilterChange}
        />
        <SchemasFilter
          filters={query && query.filters}
          schemas={data && data.schemas}
          onChange={handleFilterChange}
        />
      </div>
      <Spin spinning={showSpinner}>
        <InfiniteScroll
          makeKey={(resource: Resource) => resource.id}
          itemComponent={(resource: Resource, index: number) => {
            if (!resource || !resource.id) {
              //  @ts-ignore trying to debug a hard-to-replicate behavior
              // if this happens to you, let me know!
              console.warn('strange resource found', resource);
              return null;
            }
            return (
              <div key={resource.id}>
                <ListItem
                  onClick={handleOnClick(resource)}
                  label={
                    <Popover
                      content={
                        <ResourceMetadataCard
                          {...{ ...resource, name: resource.name }}
                        />
                      }
                      mouseEnterDelay={MOUSE_ENTER_DELAY}
                      key={resource.id}
                    >
                      {resource.name}
                    </Popover>
                  }
                  id={resource.id}
                  details={
                    resource.type && !!resource.type.length ? (
                      <TypesIconList type={resource.type} />
                    ) : null
                  }
                />
              </div>
            );
          }}
          loadNextPage={next}
          fetchablePaginatedList={fetchablePaginatedList}
        />
      </Spin>
    </div>
  );
};

export default QueryComponent;
