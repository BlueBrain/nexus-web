import * as React from 'react';

import ResourcesPane from '../components/ResourcesPane';
import ResourcesList from '../components/ResourcesList';

const ActivityResourcesContainer: React.FC<{}> = () => {
  const resources = [
    {
      '@id': 'test',
      name: 'Validation',
      '@type': 'code',
    },
  ];

  return (
    <ResourcesPane>
      <ResourcesList resources={resources} />
    </ResourcesPane>
  );
};

export default ActivityResourcesContainer;
