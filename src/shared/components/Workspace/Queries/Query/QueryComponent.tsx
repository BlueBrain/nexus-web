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

const MOUSE_ENTER_DELAY = 0.5;

interface QueryComponentProps {
  list: List;
  goToResource: (resource: Resource) => void;
  next: VoidFunction;
  updateList: (list: List) => void;
  deleteList: () => void;
}

const QueryComponent: React.FunctionComponent<QueryComponentProps> = props => {
  const {
    list: {
      name,
      results: { error, isFetching, data },
    },
    goToResource,
    updateList,
    deleteList,
    next,
  } = props;
  console.log({ props });
  const handleOnClick = (resource: Resource) => () => goToResource(resource);
  const handleUpdate = (value: string) => {
    updateList({ ...props.list, name: value });
  };
  const handleDelete = () => {
    deleteList();
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
          defaultValue={name}
          onChange={handleUpdate}
          size="small"
        />
        <Icon type="close" className="close-button" onClick={handleDelete} />
      </h3>
      <div className="controls">
        <Input
          className="search"
          // value={value}
          // ref={inputEl}
          // onPressEnter={handleInputEnter}
          // // onBlur={handleBlurEvent}
          // onChange={handleInputChange}
          // allowClear={true}
        />
        <Tooltip title="Clear filters">
          <Button
            icon="close-circle"
            // onClick={onClear}
            style={{ marginRight: '2px' }}
          />
        </Tooltip>
        <Tooltip title="Refresh list">
          <Button
            icon="reload"
            // onClick={onRefreshList}
            style={{ marginRight: '2px' }}
          />
        </Tooltip>
        <Tooltip title="Clone this query">
          <Button
            icon="switcher"
            // onClick={onCloneList}
            style={{ marginRight: '2px' }}
          />
        </Tooltip>
        <Tooltip title="View ElasticSearch query">
          <Button icon="search" />
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
