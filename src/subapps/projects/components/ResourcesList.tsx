import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';

import ActivityResourceItem from './ActivityResourceItem';

import './ResourcesList.less';

const ResourcesList: React.FC<{
  resources: Resource[];
  projectLabel: string;
  orgLabel: string;
}> = ({ resources, projectLabel, orgLabel }) => {
  return (
    <div className="resources-list">
      <div className="resources-list__controls">
        <div>Search: coming soon</div>
        <div>Filters: coming soon</div>
      </div>
      <div className="resources-list__resources">
        {resources.map(resource => (
          <ActivityResourceItem
            item={resource}
            key={resource['@id']}
            link={`/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
              resource['@id']
            )}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ResourcesList;
