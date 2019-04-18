import * as React from 'react';
import { List } from '../../../../store/reducers/lists';
import './query-component.less';
import InfiniteScroll from '../../../Animations/InfiniteScroll';
import ListItem from '../../../Animations/ListItem';
import { FetchableState } from '../../../../store/reducers/utils';
import { PaginatedList, Resource } from '@bbp/nexus-sdk';
import ResourceMetadataCard from '../../../Resources/MetadataCard';
import { Popover } from 'antd';
import TypesIconList from '../../../Types/TypesIcon';
import { queryResources } from '../../../../store/actions/queryResource';

const MOUSE_ENTER_DELAY = 0.5;

interface QueryComponentProps extends List {
  goToResource: (resource: Resource) => void;
  next: VoidFunction;
}

const QueryComponent: React.FunctionComponent<QueryComponentProps> = props => {
  const {
    name,
    goToResource,
    next,
    results: { error, isFetching, data },
  } = props;
  console.log({ props });
  const handleOnClick = (resource: Resource) => () => goToResource(resource);
  const fetchablePaginatedList: FetchableState<PaginatedList<Resource>> = {
    error,
    isFetching,
    data: (data && data.resources) || null,
  };
  return (
    <div className="query-component">
      {name}
      <InfiniteScroll
        makeKey={(resource: Resource) => resource.id}
        itemComponent={(resource: Resource, index: number) => {
          return (
            <Popover
              content={
                <ResourceMetadataCard
                  {...{ ...resource, name: resource.name }}
                />
              }
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
          );
        }}
        loadNextPage={next}
        fetchablePaginatedList={fetchablePaginatedList}
      />
    </div>
  );
};

export default QueryComponent;
