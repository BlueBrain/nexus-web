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
        '@id': 'http://schema.org/hasParent',
        '@type': '@id',
      },
      dueDate: {
        '@id': 'https://bluebrainnexus.io/workflowstep/dueDate',
      },
      positionX: {
        '@id': 'https://bluebrainnexus.io/workflowstep/positionX',
      },
      positionY: {
        '@id': 'https://bluebrainnexus.io/workflowstep/positionY',
      },
      status: {
        '@id': 'https://bluebrainnexus.io/workflowstep/status',
      },
      summary: {
        '@id': 'https://bluebrainnexus.io/workflowstep/summary',
      },
      activityType: {
        '@id': 'https://bluebrainnexus.io/workflowstep/activityType',
      },
      wasInformedBy: {
        '@id': 'https://bluebrainnexus.io/workflowstep/wasInformedBy',
        '@container': '@set',
        '@type': '@id',
      },
      activities: {
        '@id': 'https://bluebrainnexus.io/workflowstep/activities',
        '@container': '@set',
        '@type': '@id',
      },
      inputs: {
        '@id': 'https://bluebrainnexus.io/workflowstep/inputs',
        '@container': '@set',
        '@type': '@id',
      },
      wasAssociatedWith: {
        '@id': 'https://bluebrainnexus.io/workflowstep/wasAssociatedWith',
        '@container': '@set',
        '@type': '@id',
      },
    },
  ],
  '@id': 'https://bluebrainnexus.io/workflowstep/context',
};
