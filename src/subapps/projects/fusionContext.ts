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
    },
  ],
  '@id': 'https://bluebrainnexus.io/workflowStep/table-context',
};
