import * as React from 'react';
import { List } from 'antd';
import { PaginatedList, Resource, PaginationSettings } from '@bbp/nexus-sdk';
import ResourceItem, { ResourceItemProps } from './ResourceItem';

import './Resources.less';

export interface ResourceListProps {
  resources: PaginatedList<Resource>;
  paginationChange: any;
  paginationSettings: PaginationSettings;
  loading?: boolean;
}

const DEFAULT_PAGE_SIZE = 20;

const ResourceList: React.FunctionComponent<ResourceListProps> = ({
  resources,
  paginationChange,
  paginationSettings,
  loading = false,
}) => {
  const { total, results } = resources;
  const { from, size } = paginationSettings;
  const totalPages = Math.floor(total / size);
  const current = Math.floor((totalPages / total) * from + 1);
  return (
    <List
      className="resources-list"
      loading={loading}
      header={
        <p className="result">{`Found ${total} resource${total > 1 && 's'}`}</p>
      }
      dataSource={results}
      pagination={{
        total,
        current,
        onChange: paginationChange,
        pageSize: DEFAULT_PAGE_SIZE,
      }}
      renderItem={(resource: ResourceItemProps) => (
        <ResourceItem key={resource.id} {...resource} />
      )}
    />
  );
};

export default ResourceList;
