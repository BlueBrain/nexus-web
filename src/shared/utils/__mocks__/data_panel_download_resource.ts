import { ResourceObscured } from 'shared/organisms/DataPanel/DataPanel';

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
  _createdBy: 'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
  _deprecated: false,
  _incoming:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/ontologies/http:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fontologies%2Fdatasettypes%2F/incoming',
  _outgoing:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/ontologies/http:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fontologies%2Fdatasettypes%2F/outgoing',
  _project: 'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
  _rev: 3,
  _schemaProject: 'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
  _self:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/ontologies/http:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fontologies%2Fdatasettypes%2F',
  _updatedAt: '2022-06-17T22:28:51.314Z',
  _updatedBy:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
};

export const fileResourceWithNoDistribution = {
  '@context': [
    'https://bluebrain.github.io/nexus/contexts/files.json',
    'https://bluebrain.github.io/nexus/contexts/metadata.json',
  ],
  '@id': 'https://bbp.epfl.ch/neurosciencegraph/data/938fb28f-6e5c-434f-8d12-572e5c005f73',
  '@type': 'File',
  _bytes: 318076,
  _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/files.json',
  _createdAt: '2022-03-31T16:54:52.580Z',
  _createdBy:
    'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
  _deprecated: false,
  _digest: {
    _algorithm: 'SHA-256',
    _value: '84da895fdc949ae7b7bd55192a8fef3b1cd5721c06b0993339e0cc42997bd3a4',
  },
  _filename: 'C120501B1-MT-C1_IDRest.zip',
  _incoming:
    'https://dev.nise.bbp.epfl.ch/nexus/v1/files/copies/sscx/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F938fb28f-6e5c-434f-8d12-572e5c005f73/incoming',
  _mediaType: 'application/zip',
  _origin: 'Client',
  _outgoing:
    'https://dev.nise.bbp.epfl.ch/nexus/v1/files/copies/sscx/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F938fb28f-6e5c-434f-8d12-572e5c005f73/outgoing',
  _project: 'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/sscx',
  _rev: 1,
  _self:
    'https://dev.nise.bbp.epfl.ch/nexus/v1/files/copies/sscx/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F938fb28f-6e5c-434f-8d12-572e5c005f73',
  _storage: {
    '@id': 'https://bluebrain.github.io/nexus/vocabulary/diskStorageDefault',
    '@type': 'DiskStorage',
    _rev: 1,
  },
  _updatedAt: '2022-03-31T16:54:52.580Z',
  _updatedBy:
    'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
  _uuid: '5673b3ae-bdd6-43b4-a3ca-aa6c771edbfa',
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
        value: 'a437b287d355f8ef7164ee9a4be74d7aaaf337567118cfca0c18c160162de54c',
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
        value: 'd42b18a85c62630c9de0503667622d318db9618b93d36a09dfe20a1650be9260',
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
        value: 'a8b498c2901b732d04ace13d394a0139b85b8f752bb39fb43c94149e47fa8887',
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
        value: 'f0f81f86e47221ade1b37a8f39377f15690b20c4816c7b2912c03236cd8d45a9',
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
  _project: 'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
  _rev: 90,
  _schemaProject: 'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
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
  _project: 'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
  _rev: 90,
  _schemaProject: 'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
  _self:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/resources/neurosciencegraph/datamodels/ontologies/https:%2F%2Fbbp.epfl.ch%2Fontologies%2Fcore%2Fmolecular-systems',
  _updatedAt: '2023-05-31T11:39:11.272Z',
  _updatedBy:
    'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-brain-modeling-ontology-ci-cd',
};

const fakeUUID = '91297885-2978-458e-b2a5-c8e77c6f44f4';

export const getMockResource = (
  name: string = 'slimshady',
  localStorageType: 'resource' | 'distribution' = 'resource',
  org: string = 'orgLabel',
  project = 'projectLabel',
  resourceOrFile: string = 'Resource'
): ResourceObscured => {
  return {
    name,
    localStorageType,
    size: 0,
    contentType: '',
    distribution: {
      hasDistribution: true,
      contentSize: 0,
      encodingFormat: '',
      label: '',
    },
    id: `https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/${fakeUUID}`,
    _self: `https://staging.nise.bbp.epfl.ch/nexus/v1/resources/${org}/${project}/datashapes:neuronmorphology/neuronmorphologies%2F${fakeUUID}`,
    '@type': resourceOrFile,
    resourceId: `https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/${fakeUUID}`,
    project: `${org}/${project}`,
    path: `/integration/neuronmorphologies%${fakeUUID}/${fakeUUID}`,
  };
};

export const getMockDistribution = (fileName: string) => {
  return {
    _filename: fileName,
    '@context': [
      'https://bluebrain.github.io/nexus/contexts/files.json',
      'https://bluebrain.github.io/nexus/contexts/metadata.json',
    ],
    '@id': `https://bbp.epfl.ch/neurosciencegraph/data/${fakeUUID}`,
    '@type': 'File',
    _bytes: 1012929,
    _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/files.json',
    _createdAt: '2021-09-29T13:04:09.987Z',
    _createdBy: 'https://staging.nise.bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
    _deprecated: false,
    _digest: {
      _algorithm: 'SHA-256',
      _value: '0bd0553109bec4c2cb920b87d46bbcbef0073feec1a00f3f18c9dd83118c38d3',
    },
    _incoming: `https://staging.nise.bbp.epfl.ch/nexus/v1/files/tests/integration/${fakeUUID}/incoming`,
    _location:
      'file:///gpfs/bbp.cscs.ch/data/project/nexustest/nexus-staging/tests/integration/d/1/e/5/2/f/2/b/mtC161001A_idA.swc',
    _mediaType: 'application/swc',
    _outgoing: `https://staging.nise.bbp.epfl.ch/nexus/v1/files/tests/integration/${fakeUUID}/outgoing`,
    _project: 'https://staging.nise.bbp.epfl.ch/nexus/v1/projects/tests/integration',
    _rev: 1,
    _self: `https://staging.nise.bbp.epfl.ch/nexus/v1/files/tests/integration/${fakeUUID}`,
    _storage: {
      '@id': 'https://bbp.epfl.ch/neurosciencegraph/data/33dac360-7175-4d51-954d-1285b03d2c11',
      '@type': 'RemoteDiskStorage',
      _rev: 1,
    },
    _updatedAt: '2021-09-29T13:04:09.987Z',
    _uuid: 'd1e52f2b-47e6-4b56-bf37-d3080ef086af',
  };
};
