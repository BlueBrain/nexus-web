import * as React from 'react';
import { Popover } from 'antd';
import { PaginatedList, Resource } from '@bbp/nexus-sdk';
import ResourceItem from './ResourceItem';
import './Resources.less';
import AnimatedList from '../Animations/AnimatedList';
import { Link } from 'react-router-dom';
import ResourceMetadataCard from './MetaData';

let ReactJson: any;
if (typeof window !== 'undefined') {
  ReactJson = require('react-json-view').default;
}

const MOUSE_ENTER_DELAY = 0.5;

export interface ResourceListProps {
  header?: React.ReactNode;
  resources: PaginatedList<Resource>;
  paginationChange: any;
  paginationSettings: { total: number; from: number; pageSize: number };
  loading?: boolean;
  navigateToResource: (resource: Resource) => void;
}

const ResourceList: React.FunctionComponent<ResourceListProps> = ({
  header = <div />,
  resources,
  navigateToResource,
  paginationChange,
  paginationSettings,
  loading = false,
}) => {
  const { total, results } = resources;

  return (
    <>
      <AnimatedList
        header={header}
        itemClassName="resource-list-item-container"
        itemComponent={(resource: Resource, index: number) => (
          <Popover
            content={<ResourceMetadataCard {...resource} />}
            mouseEnterDelay={MOUSE_ENTER_DELAY}
          >
            <Link
              to={{
                pathname: `/${resource.orgLabel}/${
                  resource.projectLabel
                }/${encodeURIComponent(resource.id)}`,
                state: {
                  modal: true,
                  returnTo: location ? location.pathname : null,
                },
              }}
            >
              <ResourceItem
                index={index}
                key={resource.id}
                name={resource.name}
                {...resource}
                onClick={() => navigateToResource(resource)}
              />
            </Link>
          </Popover>
        )}
        itemName="Resource"
        results={results}
        total={total}
        onPaginationChange={paginationChange}
        paginationSettings={paginationSettings}
        loading={loading}
      />
    </>
  );
};

export default ResourceList;
