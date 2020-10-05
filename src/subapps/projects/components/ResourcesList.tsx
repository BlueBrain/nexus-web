import * as React from 'react';
import ActivityResourceItem from './ActivityResourceItem';

import './ResourcesList.less';

const ResourcesList: React.FC<{ resources: any[] }> = ({ resources }) => {
  return (
    <div className="resources-list">
      <div className="resources-list__controls">
        <div>Search: coming soon</div>
        <div>Filters: coming soon</div>
      </div>
      <div className="resources-list__resources">
        {resources.map(resource => (
          <ActivityResourceItem item={resource} key={resource['@id']} />
        ))}
      </div>
    </div>
  );
};

export default ResourcesList;
