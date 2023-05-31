export const resourceWithoutDistrition = {
  '@context': [
    'https://bluebrain.github.io/nexus/contexts/metadata.json',
    'https://bbp.neuroshapes.org',
  ],
  '@id': 'http://bbp.epfl.ch/neurosciencegraph/ontologies/datasettypes/',
  '@type': 'Ontology',
  'http://neuroshapes.org/defines': [
    {
      '@id': 'http://neuroshapes.org/ElectricalSeries',
      '@type': 'Class',
      label: 'Electrical Series',
      prefLabel: 'Electrical Series',
      subClassOf: {
        '@id': 'http://neuroshapes.org/TimeSeries',
        '@type': 'Class',
        label: 'Time Series',
        prefLabel: 'Time Series',
      },
    },
    {
      '@id': 'http://neuroshapes.org/RecordedElectrophysiologyTrace',
    },
  ],
  label: 'Dataset Type Ontology',
  _constrainedBy: 'https://neuroshapes.org/dash/ontology',
  _createdAt: '2021-03-12T16:47:13.811Z',
  _createdBy:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
  _deprecated: false,
  _incoming:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/ontologies/http:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fontologies%2Fdatasettypes%2F/incoming',
  _outgoing:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/ontologies/http:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fontologies%2Fdatasettypes%2F/outgoing',
  _project:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
  _rev: 3,
  _schemaProject:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
  _self:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/ontologies/http:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fontologies%2Fdatasettypes%2F',
  _updatedAt: '2022-06-17T22:28:51.314Z',
  _updatedBy:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
};

export const resourceWithDistributionArray = {
  '@context': [
    'https://bluebrain.github.io/nexus/contexts/metadata.json',
    'https://neuroshapes.org',
  ],
  '@id': 'https://bbp.epfl.ch/ontologies/core/molecular-systems',
  '@type': 'Ontology',
  distribution: [
    {
      '@type': 'DataDownload',
      atLocation: {
        '@type': 'Location',
        store: {
          '@id': 'nxv:diskStorageDefault',
        },
      },
      contentSize: {
        unitCode: 'bytes',
        value: 15135,
      },
      contentUrl:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/files/neurosciencegraph/datamodels/ea291513-bf28-4774-b4ad-eb545975939b',
      digest: {
        algorithm: 'SHA-256',
        value:
          'a437b287d355f8ef7164ee9a4be74d7aaaf337567118cfca0c18c160162de54c',
      },
      encodingFormat: 'text/turtle',
      name: 'molecular-systems.ttl',
    },
    {
      '@type': 'DataDownload',
      atLocation: {
        '@type': 'Location',
        store: {
          '@id': 'nxv:diskStorageDefault',
        },
      },
      contentSize: {
        unitCode: 'bytes',
        value: 25946,
      },
      contentUrl:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/files/neurosciencegraph/datamodels/bb53e5e4-d9c6-4b78-aa05-d79955add281',
      digest: {
        algorithm: 'SHA-256',
        value:
          'd42b18a85c62630c9de0503667622d318db9618b93d36a09dfe20a1650be9260',
      },
      encodingFormat: 'application/ld+json',
      name: 'molecular-systems.json',
    },
    {
      '@type': 'DataDownload',
      atLocation: {
        '@type': 'Location',
        store: {
          '@id': 'nxv:diskStorageDefault',
        },
      },
      contentSize: 12821,
      contentUrl:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/files/neurosciencegraph/datamodels/951aebdd-2771-4bfe-a4e2-6163d61b7bfa',
      digest: {
        algorithm: 'SHA-256',
        value:
          'a8b498c2901b732d04ace13d394a0139b85b8f752bb39fb43c94149e47fa8887',
      },
      encodingFormat: 'text/csv',
      name: 'molecular-systems.csv',
    },
    {
      '@type': 'DataDownload',
      atLocation: {
        '@type': 'Location',
        store: {
          '@id': 'nxv:diskStorageDefault',
        },
      },
      contentSize: {
        unitCode: 'bytes',
        value: 26079,
      },
      contentUrl:
        'https://staging.nise.bbp.epfl.ch/nexus/v1/files/neurosciencegraph/datamodels/8b08fd98-2eba-4a1c-847b-77b6e445f177',
      digest: {
        algorithm: 'SHA-256',
        value:
          'f0f81f86e47221ade1b37a8f39377f15690b20c4816c7b2912c03236cd8d45a9',
      },
      encodingFormat: 'text/json',
      name: 'synthetic_texts_Molecular_systems.json',
    },
  ],
  label: 'Molecular Systems Ontology',
  versionInfo: 'R45',
  _constrainedBy: 'https://neuroshapes.org/dash/ontology',
  _createdAt: '2021-09-01T12:57:36.149Z',
  _createdBy:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-brain-modeling-ontology-ci-cd',
  _deprecated: false,
  _incoming:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/ontologies/https:%2F%2Fbbp.epfl.ch%2Fontologies%2Fcore%2Fmolecular-systems/incoming',
  _outgoing:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/ontologies/https:%2F%2Fbbp.epfl.ch%2Fontologies%2Fcore%2Fmolecular-systems/outgoing',
  _project:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
  _rev: 90,
  _schemaProject:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
  _self:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/ontologies/https:%2F%2Fbbp.epfl.ch%2Fontologies%2Fcore%2Fmolecular-systems',
  _updatedAt: '2023-05-31T11:39:11.272Z',
  _updatedBy:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-brain-modeling-ontology-ci-cd',
};

export const resourceWithDistributionObject = {
  '@context': [
    'https://bluebrain.github.io/nexus/contexts/metadata.json',
    'https://neuroshapes.org',
  ],
  '@id': 'https://bbp.epfl.ch/ontologies/core/molecular-systems',
  '@type': 'Ontology',
  distribution: {
    '@type': 'DataDownload',
    atLocation: {
      '@type': 'Location',
      store: {
        '@id': 'nxv:diskStorageDefault',
      },
    },
    contentSize: {
      unitCode: 'bytes',
      value: 15135,
    },
    contentUrl:
      'https://staging.nise.bbp.epfl.ch/nexus/v1/files/neurosciencegraph/datamodels/ea291513-bf28-4774-b4ad-eb545975939b',
    digest: {
      algorithm: 'SHA-256',
      value: 'a437b287d355f8ef7164ee9a4be74d7aaaf337567118cfca0c18c160162de54c',
    },
    encodingFormat: 'text/turtle',
    name: 'molecular-systems.ttl',
  },
  label: 'Molecular Systems Ontology',
  versionInfo: 'R45',
  _constrainedBy: 'https://neuroshapes.org/dash/ontology',
  _createdAt: '2021-09-01T12:57:36.149Z',
  _createdBy:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-brain-modeling-ontology-ci-cd',
  _deprecated: false,
  _incoming:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/ontologies/https:%2F%2Fbbp.epfl.ch%2Fontologies%2Fcore%2Fmolecular-systems/incoming',
  _outgoing:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/ontologies/https:%2F%2Fbbp.epfl.ch%2Fontologies%2Fcore%2Fmolecular-systems/outgoing',
  _project:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
  _rev: 90,
  _schemaProject:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
  _self:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/ontologies/https:%2F%2Fbbp.epfl.ch%2Fontologies%2Fcore%2Fmolecular-systems',
  _updatedAt: '2023-05-31T11:39:11.272Z',
  _updatedBy:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-brain-modeling-ontology-ci-cd',
};
