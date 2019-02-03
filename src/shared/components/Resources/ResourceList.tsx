import * as React from 'react';
import { Drawer } from 'antd';
import { PaginatedList, Resource, PaginationSettings } from '@bbp/nexus-sdk';
import ResourceItem, { ResourceItemProps } from './ResourceItem';
import './Resources.less';
import AnimatedList from '../Animations/AnimatedList';

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
  const [selectedResource, setSelectedResource] = React.useState(
    null as Resource | null
  );
  return (
    <>
      <AnimatedList
        header={header}
        itemComponent={(resource: Resource, index: number) => (
          <ResourceItem
            index={index}
            key={resource.id}
            name={resource.name}
            {...resource}
            onClick={() => setSelectedResource(resource)}
          />
        )}
        itemName="Resource"
        results={results}
        total={total}
        onPaginationChange={paginationChange}
        paginationSettings={paginationSettings}
        loading={loading}
      />
      {typeof window !== 'undefined' && selectedResource && (
        <Drawer
          width={640}
          placement="right"
          onClose={() => setSelectedResource(null)}
          visible={!!selectedResource}
          title={selectedResource.name}
        >
          <ReactJson src={selectedResource.raw} name={null} />
        </Drawer>
      )}
    </>
  );
};

export default ResourceList;
