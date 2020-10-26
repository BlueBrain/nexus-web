import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Empty } from 'antd';

import ActivityResourceItem from './ActivityResourceItem';

import './ResourcesList.less';

const ResourcesList: React.FC<{
  resources: Resource[];
  projectLabel: string;
  orgLabel: string;
}> = ({ resources, projectLabel, orgLabel }) => {
  return (
    <div className="resources-list">
      <div className="resources-list__resources">
        {resources.length > 0 ? (
          resources.map(resource => (
            <ActivityResourceItem
              item={resource}
              key={`resource-item-${resource['@id']}`}
              link={`/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
                resource['@id']
              )}`}
            />
          ))
        ) : (
          <Empty description="No resources found for this Activity" />
        )}
      </div>
    </div>
  );
};

export default ResourcesList;
