import * as React from 'react';
import {
  Tooltip,
  Button,
  Spin,
  Switch,
  Empty,
  Popover,
  Menu,
  Dropdown,
} from 'antd';
import {
  CloseCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  LinkOutlined,
  ReloadOutlined,
  SortAscendingOutlined,
  SwitcherOutlined,
} from '@ant-design/icons';
import { ResourceList, Resource } from '@bbp/nexus-sdk';

import RenameableItem from '../Renameable';
import InfiniteSearch from '../List/InfiniteSearch';
import ListItem from '../List/Item';
import ResourceCardComponent from '../ResourceCard';
import { getResourceLabel } from '../../utils';
import TypesIconList from '../Types/TypesIcon';
import useMeasure from '../../hooks/useMeasure';
import Copy from '../Copy';

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
const DEFAULT_SORT_OPTION = '-_createdAt';

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
  onSortBy(option: string): void;
  makeResourceUri(resourceId: string): string;
  goToResource(resourceId: string): void;
  shareableLink: string;
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
  onSortBy,
  makeResourceUri,
  goToResource,
  children,
  schemaLinkContainer,
  shareableLink,
}) => {
  const [{ ref: wrapperHeightRef }, { height: wrapperHeight }] = useMeasure();
  const { name } = list;
  const [sortOption, setSortOption] = React.useState(DEFAULT_SORT_OPTION);

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

  const onChangeSort = (option: any) => {
    const { key } = option;

    setSortOption(key);
    onSortBy(key);
  };

  const hasMore = resources.length < Number(total || 0);

  const sortOptions = (
    <Menu onClick={onChangeSort} selectedKeys={[sortOption]}>
      <Menu.Item key="-_createdAt">Newest</Menu.Item>
      <Menu.Item key="_createdAt">Oldest</Menu.Item>
    </Menu>
  );

  return (
    <div className="resource-list-height-tester" ref={wrapperHeightRef}>
      <div className="resource-list">
        <h3 className={`header ${busy ? '-fetching' : ''}`}>
          <RenameableItem
            defaultValue={name || 'Unnamed List'}
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
          <CloseOutlined className="close-button" onClick={handleDelete} />
        </h3>
        <div className="controls -squished">
          <Copy
            textToCopy={shareableLink}
            render={(copySuccess, triggerCopy) => (
              <a
                href={shareableLink}
                onClick={e => {
                  e.preventDefault();
                  triggerCopy();
                }}
              >
                <Tooltip title={copySuccess ? 'Copied' : 'Copy shareable link'}>
                  <Button icon={<LinkOutlined />} />
                </Tooltip>
              </a>
            )}
          />
          {!list.query.q && (
            <Dropdown overlay={sortOptions} trigger={['hover', 'click']}>
              <Tooltip title="Sort resources">
                <Button icon={<SortAscendingOutlined />} />
              </Tooltip>
            </Dropdown>
          )}
          <Tooltip title="Clear filters">
            <Button icon={<CloseCircleOutlined />} onClick={handleClear} />
          </Tooltip>
          <Tooltip title="Refresh list">
            <Button icon={<ReloadOutlined />} onClick={handleRefreshList} />
          </Tooltip>
          <Tooltip title="Clone this query">
            <Button icon={<SwitcherOutlined />} onClick={handleCloneList} />
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
              checkedChildren={<DeleteOutlined />}
              unCheckedChildren={<DeleteOutlined />}
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
                  <a
                    href={makeResourceUri(resource['@id'])}
                    key={resource['@id']}
                    onClick={e => {
                      e.preventDefault();
                      goToResource(resource['@id']);
                    }}
                  >
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
                        {getResourceLabel(resource)}
                        {!!resource['@type'] &&
                          (Array.isArray(resource['@type']) ? (
                            <TypesIconList type={resource['@type']} />
                          ) : (
                            <TypesIconList type={[resource['@type']]} />
                          ))}
                      </Popover>
                    </ListItem>
                  </a>
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
