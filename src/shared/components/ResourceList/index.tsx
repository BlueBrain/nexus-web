import * as React from 'react';
import { Icon, Tooltip, Button, Spin, Switch, Empty, Popover } from 'antd';
import { ResourceList, Resource } from '@bbp/nexus-sdk';

import RenameableItem from '../Renameable';
import InfiniteSearch from '../List/InfiniteSearch';
import ListItem from '../List/Item';
import ResourceCardComponent from '../ResourceCard';
import { getResourceLabel } from '../../utils';
import TypesIconList from '../Types/TypesIcon';
import useMeasure from '../../hooks/useMeasure';

import './ResourceList.less';

export type ResourceBoardList = {
  name: string;
  view: string;
  id: string;
  query: {
    from?: number;
    size?: number;
    deprecated?: boolean;
    rev?: number;
    type?: string;
    createdBy?: string;
    updatedBy?: string;
    schema?: string;
    q?: string;
    sort?: string | string[];
  };
};

const RESOURCE_CARD_MOUSE_ENTER_DELAY = 0.5;

const ResourceListComponent: React.FunctionComponent<{
  busy: boolean;
  list: ResourceBoardList;
  resources: ResourceList<{}>['_results'];
  schemaLinkContainer?: React.FunctionComponent<{ resource: Resource }>;
  total?: number;
  error: Error | null;
  onDelete(): void;
  onClone(): void;
  onUpdate(list: ResourceBoardList): void;
  onLoadMore({ searchValue }: { searchValue: string }): void;
  onRefresh(): void;
  onSort(): void;
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
  onSort,
  makeResourceUri,
  goToResource,
  children,
  schemaLinkContainer,
}) => {
  const [{ ref: wrapperHeightRef }, { height: wrapperHeight }] = useMeasure();
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
    <div className="resource-list-height-tester" ref={wrapperHeightRef}>
      <div className="resource-list">
        <h3 className={`header ${busy ? '-fetching' : ''}`}>
          <RenameableItem
            defaultValue={name}
            onChange={handleUpdate}
            size="small"
          />
          <div className="count">
            {!!resources.length && (
              <>
                <b>{resources.length.toLocaleString()}</b> /{' '}
              </>
            )}
            {!!total &&
              `${total.toLocaleString()} result${total > 1 ? 's' : ''}`}
          </div>
          <Icon type="close" className="close-button" onClick={handleDelete} />
        </h3>
        <div className="controls -squished">
          <Tooltip title="Sort by date">
            <Button icon="arrow-down" onClick={onSort} />
          </Tooltip>
          <Tooltip title="Clear filters">
            <Button icon="close-circle" onClick={handleClear} />
          </Tooltip>
          <Tooltip title="Refresh list">
            <Button icon="reload" onClick={handleRefreshList} />
          </Tooltip>
          <Tooltip title="Clone this query">
            <Button icon="switcher" onClick={handleCloneList} />
          </Tooltip>
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
        <div className="controls">{children}</div>
        <Spin spinning={busy}>
          {!!error && <Empty description={error.message} />}
          {!error && (
            <InfiniteSearch
              dataLength={resources.length}
              onLoadMore={onLoadMore}
              hasMore={hasMore}
              height={wrapperHeight - 200} // additional padding for extra chonky list items
              defaultSearchValue={list.query.q}
            >
              {resources.map(resource => {
                return (
                  <ListItem
                    key={resource['@id']}
                    onClick={() => goToResource(resource['@id'])}
                  >
                    <Popover
                      content={
                        <div style={{ width: 600 }}>
                          <ResourceCardComponent
                            resource={resource}
                            schemaLink={schemaLinkContainer}
                          />
                        </div>
                      }
                      mouseEnterDelay={RESOURCE_CARD_MOUSE_ENTER_DELAY}
                    >
                      <a
                        href={makeResourceUri(resource['@id'])}
                        onClick={e => {
                          e.preventDefault();
                          goToResource(resource['@id']);
                        }}
                      >
                        {getResourceLabel(resource)}
                      </a>
                      {!!resource['@type'] &&
                        (Array.isArray(resource['@type']) ? (
                          <TypesIconList type={resource['@type']} />
                        ) : (
                          <TypesIconList type={[resource['@type']]} />
                        ))}
                    </Popover>
                  </ListItem>
                );
              })}
            </InfiniteSearch>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default ResourceListComponent;
