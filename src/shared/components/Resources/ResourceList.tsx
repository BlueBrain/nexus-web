import * as React from 'react';
import { PaginatedList, Resource, NexusFile } from '@bbp/nexus-sdk';
import ResourceItem from './ResourceItem';
import './Resources.less';
import AnimatedList from '../Animations/AnimatedList';

export interface ResourceListProps {
  header?: React.ReactNode;
  resources: PaginatedList<Resource>;
  paginationChange: any;
  paginationSettings: { total: number; from: number; pageSize: number };
  loading?: boolean;
  goToResource: (resource: Resource) => void;
  getFilePreview: (selfUrl: string) => Promise<NexusFile>;
}

const ResourceList: React.FunctionComponent<ResourceListProps> = ({
  header = <div />,
  resources,
  paginationChange,
  paginationSettings,
  loading = false,
  goToResource,
  getFilePreview,
}) => {
  const { total, results } = resources;
  return (
    <AnimatedList
      header={header}
      itemComponent={(resource: Resource, index: number) => (
        <ResourceItem
          getFilePreview={getFilePreview}
          index={index}
          resource={resource}
          onClick={() => goToResource(resource)}
        />
      )}
      itemName="Resource"
      results={results}
      total={total}
      onPaginationChange={paginationChange}
      paginationSettings={paginationSettings}
      loading={loading}
    />
  );
};

export default ResourceList;
