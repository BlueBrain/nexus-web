import * as React from 'react';
import { List, Drawer } from 'antd';
import { PaginatedList, Resource, PaginationSettings } from '@bbp/nexus-sdk';
import ResourceItem, { ResourceItemProps } from './ResourceItem';
import './Resources.less';

let ReactJson: any;
if (typeof window !== 'undefined') {
  ReactJson = require('react-json-view').default;
}

export interface ResourceListProps {
  header?: React.ReactNode;
  resources: PaginatedList<Resource>;
  paginationChange: any;
  paginationSettings: PaginationSettings;
  loading?: boolean;
}

const ResourceList: React.FunctionComponent<ResourceListProps> = ({
  header = <div />,
  resources,
  paginationChange,
  paginationSettings,
  loading = false,
}) => {
  const { total, results } = resources;
  const { from, size } = paginationSettings;
  const totalPages = Math.ceil(total / size);
  const current = Math.ceil((totalPages / total) * (from || 1));
  console.log({ total, results, from, size, totalPages, current });
  const [selectedResource, setSelectedResource] = React.useState(
    null as Resource | null
  );
  return (
    <React.Fragment>
      <List
        className="resources-list"
        loading={loading}
        header={
          <div>
            {header}
            <p className="result">{`Found ${total} resource${
              total > 1 ? 's' : ''
            }`}</p>
          </div>
        }
        dataSource={results}
        pagination={
          total
            ? {
                total,
                current,
                onChange: paginationChange,
                pageSize: size,
              }
            : undefined
        }
        renderItem={(resource: Resource) => {
          return (
            <ResourceItem
              key={resource.id}
              name={resource.name}
              {...resource}
              onClick={() => setSelectedResource(resource)}
            />
          );
        }}
      />
      {typeof window !== 'undefined' && (
        <Drawer
          width={640}
          placement="right"
          onClose={() => setSelectedResource(null)}
          visible={!!selectedResource}
        >
          {!!selectedResource && (
            <div>
              <h2>{selectedResource.name}</h2>
              <ReactJson src={selectedResource.raw} name={null} />
            </div>
          )}
        </Drawer>
      )}
    </React.Fragment>
  );
};

export default ResourceList;
