import * as React from 'react';
import { Icon, Tooltip, Button, Spin, Switch, Empty } from 'antd';
import { ResourceList } from '@bbp/nexus-sdk';

import RenameableItem from '../Renameable';

import './ResourceList.less';
import InfiniteSearch from '../List/InfiniteSearch';
import ListItem from '../List/Item';
import { ResourceBoardList } from '../../containers/ResourceListBoardContainer';

const ResourceListComponent: React.FunctionComponent<{
  busy: boolean;
  list: ResourceBoardList;
  resources: ResourceList<{}>['_results'];
  total?: number;
  error?: Error;
  onDelete(): void;
  onClone(): void;
  onUpdate(list: ResourceBoardList): void;
  onLoadMore({ searchValue }: { searchValue: string }): void;
  onRefresh(): void;
  makeResourceUri(resourceId: string): string;
  goToResource(resourceId: string): void;
}> = ({
  busy,
  list,
  total,
  error,
  resources,
  onLoadMore,
  onUpdate,
  onDelete,
  onClone,
  onRefresh,
  makeResourceUri,
  goToResource,
  children,
}) => {
  const { name } = list;

  const handleUpdate = (value: string) => {
    onUpdate({ ...list, name: value });
  };

  const handleDelete = () => {
    onDelete();
  };

  const handleClear = () => {
    onUpdate({ ...list, query: {} });
  };

  const handleCloneList = () => {
    onClone();
  };

  const handleToggleDeprecated = () => {
    onUpdate({
      ...list,
      query: {
        ...list.query,
        deprecated: !list.query.deprecated,
      },
    });
  };

  const handleRefreshList = () => {
    onRefresh();
  };

  const hasMore = resources.length < Number(total || 0);

  return (
    <div className="resource-list">
      <h3 className={`header ${busy ? '-fetching' : ''}`}>
        <RenameableItem
          defaultValue={name}
          onChange={handleUpdate}
          size="small"
        />
        <div className="count">
          {!!total && `${total} result${total > 1 ? 's' : ''}`}
        </div>
        <Icon type="close" className="close-button" onClick={handleDelete} />
      </h3>
      <div className="controls">
        <Tooltip title="Clear filters">
          <Button icon="close-circle" onClick={handleClear} />
        </Tooltip>
        <Tooltip title="Refresh list">
          <Button icon="reload" onClick={handleRefreshList} />
        </Tooltip>
        <Tooltip title="Clone this query">
          <Button icon="switcher" onClick={handleCloneList} />
        </Tooltip>
        {children}
        <div className="switches">
          <Tooltip
            title={
              list.query.deprecated
                ? 'Displaying deprecated resources only'
                : 'Not showing deprecated resources'
            }
          >
            <Switch
              onChange={handleToggleDeprecated}
              checked={list.query.deprecated}
              checkedChildren={<Icon type="delete" />}
              unCheckedChildren={<Icon type="delete" />}
            />
          </Tooltip>
        </div>
      </div>
      <Spin spinning={busy}>
        {!!error && <Empty description={error.message} />}
        {!error && (
          <InfiniteSearch onLoadMore={onLoadMore} hasMore={hasMore}>
            {resources.map(resource => {
              return (
                <ListItem
                  key={resource['@id']}
                  onClick={() => goToResource(resource['@id'])}
                >
                  <a
                    href={makeResourceUri(resource['@id'])}
                    onClick={e => {
                      e.preventDefault();
                      goToResource(resource['@id']);
                    }}
                  >
                    {resource['@id']}
                  </a>
                </ListItem>
              );
            })}
          </InfiniteSearch>
        )}
      </Spin>
    </div>
  );
};

export default ResourceListComponent;
