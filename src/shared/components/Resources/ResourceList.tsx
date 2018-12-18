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
  const [selectedResource, setSelectedResource] = React.useState(
    null as Resource | null
  );
  console.log({ selectedResource });
  return (
    <React.Fragment>
      <List
        className="resources-list"
        loading={loading}
        header={
          <p className="result">{`Found ${total} resource${total > 1 &&
            's'}`}</p>
        }
        dataSource={results}
        pagination={{
          total,
          current,
          onChange: paginationChange,
          pageSize: DEFAULT_PAGE_SIZE,
        }}
        renderItem={(resource: Resource) => (
          <ResourceItem
            key={resource.id}
            name={resource.name}
            {...resource}
            onClick={() => setSelectedResource(resource)}
          />
        )}
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
              <ReactJson src={selectedResource.raw} />
            </div>
          )}
        </Drawer>
      )}
    </React.Fragment>
  );
};

export default ResourceList;
