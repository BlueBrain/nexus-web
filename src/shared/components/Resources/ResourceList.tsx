import * as React from 'react';
import { Drawer } from 'antd';
import { PaginatedList, Resource, PaginationSettings } from '@bbp/nexus-sdk';
import ResourceItem, { ResourceItemProps } from './ResourceItem';
import './Resources.less';
import AnimatedList from '../Animations/AnimatedList';
import { Link } from 'react-router-dom';

let ReactJson: any;
if (typeof window !== 'undefined') {
  ReactJson = require('react-json-view').default;
}

export interface ResourceListProps {
  header?: React.ReactNode;
  resources: PaginatedList<Resource>;
  paginationChange: any;
  paginationSettings: { total: number; from: number; pageSize: number };
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
  const { from, pageSize } = paginationSettings;
  const totalPages = Math.ceil(total / pageSize);
  const current = Math.ceil((totalPages / total) * (from || 1));
  const handleKeyPress = (e: KeyboardEvent) => {
    const code = e.keyCode || e.which;
    // enter is pressed
    if (code === 27) {
      // Navigate
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress, false);
    return () => {
      document.removeEventListener('keydown', handleKeyPress, false);
    };
  });

  return (
    <>
      <AnimatedList
        header={header}
        itemComponent={(resource: Resource, index: number) => (
          <Link
            to={{
              pathname: `/${resource.orgLabel}/${resource.projectLabel}/${
                resource.id
              }`,
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
            />
          </Link>
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
