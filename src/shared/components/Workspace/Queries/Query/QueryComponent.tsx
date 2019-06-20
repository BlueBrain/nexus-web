import * as React from 'react';
import { List, DEFAULT_LIST } from '../../../../store/reducers/lists';
import './query-component.less';
import InfiniteScroll from '../../../Animations/InfiniteScroll';
import { FetchableState } from '../../../../store/reducers/utils';
import { PaginatedList, Resource, NexusFile } from '@bbp/nexus-sdk-legacy';
import { Icon, Tooltip, Button, Spin, Switch } from 'antd';
import RenameableItem from '../../../Renameable';
import FullTextSearch from './Search';
import TypesFilter from './Types';
import SchemasFilter from './Schemas';
import QueryListItem from './QueryItem';

const MOUSE_ENTER_DELAY = 0.5;

interface QueryComponentProps {
  list: List;
  goToResource: (resource: Resource) => void;
  getFilePreview: (selfUrl: string) => Promise<NexusFile>;
  goToQuery: (list: List) => void;
  next: VoidFunction;
  updateList: (list: List) => void;
  deleteList: () => void;
  cloneList: (list: List) => void;
  handleRefreshList: () => void;
  showSpinner: boolean;
}

const QueryComponent: React.FunctionComponent<QueryComponentProps> = (
  props: QueryComponentProps
) => {
  const {
    list: {
      id,
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
    getFilePreview,
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
      query: DEFAULT_LIST.query,
    });
  };
  const handleToggleDeprecated = () => {
    updateList({
      ...props.list,
      query: {
        ...props.list.query,
        filters: {
          ...props.list.query.filters,
          _deprecated: !props.list.query.filters._deprecated,
        },
      },
    });
  };
  const showDeprecated = props.list.query.filters._deprecated;
  const handleToggleDisplayManagementResources = () => {
    updateList({
      ...props.list,
      query: {
        ...props.list.query,
        filters: {
          ...props.list.query.filters,
          showManagementResources: !props.list.query.filters
            .showManagementResources,
        },
      },
    });
  };
  const showManagementResources =
    props.list.query.filters.showManagementResources;

  const handleCloneList = () => {
    cloneList({ ...props.list });
  };

  const handleFilterChange = (value: { [filterKey: string]: string }) => {
    const filterKey: string = Object.keys(value)[0];

    if (value[filterKey] === '') {
      // if the value of filter is empty, remove the key from the query
      const {
        [filterKey]: value,
        ...withoutCurrentFilterKey
      } = props.list.query.filters;
      updateList({
        ...props.list,
        query: {
          ...props.list.query,
          filters: withoutCurrentFilterKey as List['query']['filters'],
        },
      });
    } else {
      // otherwise add or modify filterKey
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
    }
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
      <h3 className={`header ${isFetching ? '-fetching' : ''}`}>
        <RenameableItem
          defaultValue={`${name} ${isFetching ? 'loading' : ''}`}
          onChange={handleUpdate}
          size="small"
        />
        <div className="count">
          {!!total && `${total} result${total > 1 ? 's' : ''}`}
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
        <div className="switches">
          <Tooltip
            title={
              showDeprecated
                ? 'Displaying deprecated resources only'
                : 'Not showing deprecated resources'
            }
          >
            <Switch
              // size="small"
              onChange={handleToggleDeprecated}
              checked={showDeprecated}
              checkedChildren={<Icon type="delete" />}
              unCheckedChildren={<Icon type="delete" />}
            />
          </Tooltip>
          <Tooltip
            title={
              showManagementResources
                ? 'Displaying management resources only'
                : 'Showing regular resources only'
            }
          >
            <Switch
              // size="small"
              onChange={handleToggleDisplayManagementResources}
              checked={showManagementResources}
              checkedChildren={<Icon type="setting" />}
              unCheckedChildren={<Icon type="setting" />}
            />
          </Tooltip>
        </div>
      </div>
      <Spin spinning={showSpinner}>
        <InfiniteScroll
          itemComponent={(resource: Resource, index: number) => {
            if (!resource || !resource.id) {
              // trying to debug a hard-to-replicate behavior
              // if this happens to you, let me know!
              // tslint:disable-next-line:no-console
              console.warn('strange resource found', resource);
              return null;
            }
            return (
              <div key={id + resource.id}>
                <QueryListItem
                  onClick={handleOnClick(resource)}
                  resource={resource}
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
