export const WORKFLOW_STEP_CONTEXT = {
  '@context': [
    {
      '@base': 'https://bluebrainnexus.io/workflowstep/',
      '@vocab': 'https://bluebrainnexus.io/workflowstep/vocabulary/',
      name: {
        '@id': 'http://schema.org/name',
      },
      description: {
        '@id': 'http://schema.org/description',
      },
      hasParent: {
        '@id': 'https://bluebrainnexus.io/workflowstep/vocabulary/hasParent',
        '@type': '@id',
      },
      dueDate: {
        '@id': 'https://bluebrainnexus.io/workflowstep/vocabulary/dueDate',
      },
      positionX: {
        '@id': 'https://bluebrainnexus.io/workflowstep/vocabulary/positionX',
      },
      positionY: {
        '@id': 'https://bluebrainnexus.io/workflowstep/vocabulary/positionY',
      },
      status: {
        '@id': 'https://bluebrainnexus.io/workflowstep/vocabulary/status',
      },
      summary: {
        '@id': 'https://bluebrainnexus.io/workflowstep/vocabulary/summary',
      },
      activityType: {
        '@id': 'https://bluebrainnexus.io/workflowstep/vocabulary/activityType',
      },
      wasInformedBy: {
        '@id':
          'https://bluebrainnexus.io/workflowstep/vocabulary/wasInformedBy',
        '@container': '@set',
        '@type': '@id',
      },
      activities: {
        '@id': 'https://bluebrainnexus.io/workflowstep/vocabulary/activities',
        '@container': '@set',
        '@type': '@id',
      },
      inputs: {
        '@id': 'https://bluebrainnexus.io/workflowstep/vocabulary/inputs',
        '@container': '@set',
        '@type': '@id',
      },
      wasAssociatedWith: {
        '@id':
          'https://bluebrainnexus.io/workflowstep/vocabulary/wasAssociatedWith',
        '@container': '@set',
        '@type': '@id',
      },
    },
  ],
  '@id': 'https://bluebrainnexus.io/workflowstep/context',
};
