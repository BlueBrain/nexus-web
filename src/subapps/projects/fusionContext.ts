export const WORKFLOW_STEP_CONTEXT = {
  '@context': [
    {
      '@base': 'https://bluebrainnexus.io/workflowStep/',
      '@vocab': 'https://bluebrainnexus.io/workflowStep/vocabulary/',
      name: {
        '@id': 'http://schema.org/name',
      },
      description: {
        '@id': 'http://schema.org/description',
      },
      hasParent: {
        '@id': 'https://bluebrainnexus.io/workflowStep/vocabulary/hasParent',
        '@type': '@id',
      },
      dueDate: {
        '@id': 'https://bluebrainnexus.io/workflowStep/vocabulary/dueDate',
      },
      positionX: {
        '@id': 'https://bluebrainnexus.io/workflowStep/vocabulary/positionX',
      },
      positionY: {
        '@id': 'https://bluebrainnexus.io/workflowStep/vocabulary/positionY',
      },
      status: {
        '@id': 'https://bluebrainnexus.io/workflowStep/vocabulary/status',
      },
      summary: {
        '@id': 'https://bluebrainnexus.io/workflowStep/vocabulary/summary',
      },
      activityType: {
        '@id': 'https://bluebrainnexus.io/workflowStep/vocabulary/activityType',
      },
      wasInformedBy: {
        '@id':
          'https://bluebrainnexus.io/workflowStep/vocabulary/wasInformedBy',
        '@container': '@set',
        '@type': '@id',
      },
      activities: {
        '@id': 'https://bluebrainnexus.io/workflowStep/vocabulary/activities',
        '@container': '@set',
        '@type': '@id',
      },
      inputs: {
        '@id': 'https://bluebrainnexus.io/workflowStep/vocabulary/inputs',
        '@container': '@set',
        '@type': '@id',
      },
      wasAssociatedWith: {
        '@id':
          'https://bluebrainnexus.io/workflowStep/vocabulary/wasAssociatedWith',
        '@container': '@set',
        '@type': '@id',
      },
    },
  ],
  '@id': 'https://bluebrainnexus.io/workflowStep/workflowStep-context',
};

export const FUSION_TABLE_CONTEXT = {
  '@context': [
    {
      '@base': 'https://bluebrainnexus.io/fusionTable/',
      '@vocab': 'https://bluebrainnexus.io/fusionTable/vocabulary/',
      name: {
        '@id': 'http://schema.org/name',
      },
      description: {
        '@id': 'http://schema.org/description',
      },
      tableOf: {
        '@id': 'https://bluebrainnexus.io/fusionTable/vocabulary/tableOf',
        '@type': '@id',
      },
      view: {
        '@id': 'https://bluebrainnexus.io/fusionTable/vocabulary/view',
      },
      enableSearch: {
        '@id': 'https://bluebrainnexus.io/fusionTable/vocabulary/enableSearch',
      },
      enableInteractiveRows: {
        '@id':
          'https://bluebrainnexus.io/fusionTable/vocabulary/enableInteractiveRows',
      },
      enableDownload: {
        '@id':
          'https://bluebrainnexus.io/fusionTable/vocabulary/enableDownload',
      },
      enableSave: {
        '@id': 'https://bluebrainnexus.io/fusionTable/vocabulary/enableSave',
      },
      resultsPerPage: {
        '@id':
          'https://bluebrainnexus.io/fusionTable/vocabulary/resultsPerPage',
      },
      dataQuery: {
        '@id': 'https://bluebrainnexus.io/fusionTable/vocabulary/dataQuery',
      },
      configuration: {
        '@container': '@set',
      },
    },
  ],
  '@id': 'https://bluebrainnexus.io/workflowStep/table-context',
};
