import * as React from 'react';

import ResourcesPane from '../components/ResourcesPane';
import ResourcesList from '../components/ResourcesList';

const ActivityResourcesContainer: React.FC<{}> = () => {
  const resources = [
    {
      '@id': 'test',
      name: 'Single Cell Electrical Modelling',
      '@type': 'FusionNote',
      description:
        'BBP Internal Documentation about Single Cell Electrical Modelling',
      permissions: 'read only',
    },
    {
      '@id': 'test-2',
      name: 'Validation_Canvas.ipynb',
      '@type': 'FusionCode',
      description:
        'Template for validating the the electrical models through a test set (a set of morphologies not used for training).',
    },
    {
      '@id': 'test-3',
      name: 'BluePyMM_Canvas.ipynb',
      '@type': 'FusionCode',
      description:
        'Template for testing different morphologies on the electrical models.',
    },
  ];

  return (
    <ResourcesPane>
      <ResourcesList resources={resources} />
    </ResourcesPane>
  );
};

export default ActivityResourcesContainer;
