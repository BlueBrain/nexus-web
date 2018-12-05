import * as React from 'react';
import { List } from 'antd';
import ResourceItem, { ResourceItemProps } from './ResourceItem';

import './Resources.less';

export interface ResourceListProps {
  resources: ResourceItemProps[];
  loading?: boolean;
}

const DEFAULT_PAGE_SIZE = 20;

const ResourceList: React.FunctionComponent<ResourceListProps> = ({
  resources,
  loading = false,
}) => {
  return (
    <List
      className="resources-list"
      loading={loading}
      header={
        <p className="result">
          {`Found ${resources.length} resource${resources.length > 1 && 's'}`}
        </p>
      }
      dataSource={resources}
      pagination={{
        onChange: page => {
          console.log(page);
        },
        pageSize: DEFAULT_PAGE_SIZE,
      }}
      renderItem={(resource: ResourceItemProps) => (
        <ResourceItem key={resource.id} {...resource} />
      )}
    />
  );
};

export default ResourceList;
