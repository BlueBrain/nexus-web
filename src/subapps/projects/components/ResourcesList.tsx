import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { Empty, Spin } from 'antd';

import ActivityResourceItem from './ActivityResourceItem';

import './ResourcesList.less';

const ResourcesList: React.FC<{
  resources: Resource[];
  projectLabel: string;
  orgLabel: string;
  busy: boolean;
}> = ({ resources, projectLabel, orgLabel, busy }) => {
  return (
    <div className="resources-list">
      <Spin spinning={busy}>
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
      </Spin>
    </div>
  );
};

export default ResourcesList;
