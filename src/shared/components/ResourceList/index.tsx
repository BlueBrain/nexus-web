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
  onUpdate(list: ResourceBoardList): void;
  onLoadMore({ searchValue }: { searchValue: string }): void;
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
  makeResourceUri,
  goToResource,
}) => {
  const { name } = list;

  const handleUpdate = (value: string) => {
    onUpdate({ ...list, name: value });
  };

  const handleDelete = () => {
    onDelete();
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
      <div className="controls"></div>
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
                  <a href={makeResourceUri(resource['@id'])}>
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
