export const WORKFLOW_STEP_CONTEXT = {
  '@context': [
    {
      '@base': 'https://bluebrainnexus.io/workflowStep/',
      '@vocab': 'https://bluebrainnexus.io/workflowStep/vocabulary/',
      nxv: 'https://bluebrain.github.io/nexus/vocabulary/',
      input: 'nxv:input',
      activity: 'nxv:activity',
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

export const PROJECT_METADATA_CONTEXT = {
  '@context': [
    {
      '@base': 'https://bluebrainnexus.io/projectMetadata/',
      '@vocab': 'https://bluebrainnexus.io/projectMetadata/vocabulary/',
      name: {
        '@id': 'http://schema.org/name',
      },
      description: {
        '@id': 'http://schema.org/description',
      },
    },
  ],
  '@id': 'https://bluebrainnexus.io/workflowStep/project-metadata-context',
};
