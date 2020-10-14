export const codeSchema = {
  '@context': {
    '@base':
      'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/fusion-adulbrich/adulbrich-github-Personal-Public/_/',
    '@vocab':
      'https://staging.nexus.ocp.bbp.epfl.ch/v1/vocabs/fusion-adulbrich/adulbrich-github-Personal-Public/',
  },
  '@type': ['SoftwareSourceCode', 'Entity'],
  name: 'MyCodeThatDoesWhatever',
  license: {
    '@id': 'https://creativecommons.org/licenses/by/4.0/',
    '@type': 'License',
  },
  contribution: {
    '@type': 'Contribution',
    agent: {
      '@id': '???',
      '@type': 'Agent',
    },
    hadRole: {
      '@id': '???',
      label: 'code author ???',
      prefLabel: 'author ???',
    },
  },
  derivation: {
    '@type': 'Derivation',
    entity: {
      '@id': '???',
      '@type': ['SoftwareSourceCode', 'Entity'],
      name: 'TheInitialCodeIUsedToWriteThisCode',
    },
  },
};
