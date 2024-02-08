import { rest } from 'msw';
import { deltaPath } from '../handlers';

const resourceResolverApiId =
  'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/bfdd4d1a-8b06-46fe-b663-7d9f8020dcaf';
const resourceResolverApi = {
  '@context': [
    'https://bluebrain.github.io/nexus/contexts/metadata.json',
    'https://bbp.neuroshapes.org',
  ],
  '@id':
    'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/bfdd4d1a-8b06-46fe-b663-7d9f8020dcaf',
  '@type': ['Entity', 'Dataset', 'NeuronMorphology', 'ReconstructedCell'],
  annotation: {
    '@type': ['MTypeAnnotation', 'Annotation'],
    hasBody: {
      '@id': 'ilx:0383236',
      '@type': ['MType', 'AnnotationBody'],
      label: 'L6_SBC',
    },
    name: 'M-type Annotation',
  },
  brainLocation: {
    '@type': 'BrainLocation',
    brainRegion: {
      '@id': 'uberon:0008933',
      label: 'primary somatosensory cortex',
    },
    layer: {
      '@id': 'uberon:0005395',
      label: 'layer 6',
    },
  },
  contribution: [
    {
      '@type': 'Contribution',
      agent: {
        '@id': 'https://orcid.org/0000-0001-9358-1315',
        '@type': 'Agent',
      },
      hadRole: {
        '@id': 'Neuron:ElectrophysiologyRecordingRole',
        label: 'neuron electrophysiology recording role',
      },
    },
    {
      '@type': 'Contribution',
      agent: {
        '@id': 'https://www.grid.ac/institutes/grid.5333.6',
        '@type': 'Agent',
      },
    },
  ],
  derivation: {
    '@type': 'Derivation',
    entity: {
      '@id':
        'https://bbp.epfl.ch/neurosciencegraph/data/350bcafe-9cbb-4c15-bad3-1caed2cbb990',
      '@type': ['PatchedCell', 'Entity'],
    },
  },
  description:
    'This dataset is about an in vitro-filled neuron morphology from layer 6 with m-type L6_SBC. The distribution contains the neuron morphology in ASC and in SWC file format.',
  distribution: [
    {
      '@type': 'DataDownload',
      atLocation: {
        '@type': 'Location',
        location:
          'file:///gpfs/bbp.cscs.ch/data/project/proj109/nexus/c7d70522-4305-480a-b190-75d757ed9a49/a/a/e/d/8/2/b/5/tkb060126a2_ch3_bc_n_jh_100x_1.asc',
        store: {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/4820323e-bee0-48d2-824f-9d9d404dbbee',
          '@type': 'RemoteDiskStorage',
          _rev: 1,
        },
      },
      contentSize: {
        unitCode: 'bytes',
        value: 1097726,
      },
      contentUrl:
        'https://bbp.epfl.ch/nexus/v1/files/public/sscx/https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fbf146eaf-48cf-4b83-b375-bbb92ce7f7c0',
      digest: {
        algorithm: 'SHA-256',
        value:
          'efcf3d6660d9769b3f3066e874c8f13536fbc398b5605ffc5acc223884362ff6',
      },
      encodingFormat: 'application/asc',
      name: 'tkb060126a2_ch3_bc_n_jh_100x_1.asc',
    },
    {
      '@type': 'DataDownload',
      atLocation: {
        '@type': 'Location',
        location:
          'file:///gpfs/bbp.cscs.ch/data/project/proj109/nexus/c7d70522-4305-480a-b190-75d757ed9a49/6/4/3/8/3/d/0/3/tkb060126a2_ch3_bc_n_jh_100x_1.swc',
        store: {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/4820323e-bee0-48d2-824f-9d9d404dbbee',
          '@type': 'RemoteDiskStorage',
          _rev: 1,
        },
      },
      contentSize: {
        unitCode: 'bytes',
        value: 891821,
      },
      contentUrl:
        'https://bbp.epfl.ch/nexus/v1/files/public/sscx/https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F60025362-1ca8-425e-908c-a01e4661c3e7',
      digest: {
        algorithm: 'SHA-256',
        value:
          '22bac983b129fe806c80a9ddb4dcf77b79c1a6a28adffd6674290fb1f014a30e',
      },
      encodingFormat: 'application/swc',
      name: 'tkb060126a2_ch3_bc_n_jh_100x_1.swc',
    },
  ],
  generation: {
    '@type': 'Generation',
    activity: {
      '@id':
        'https://bbp.epfl.ch/neurosciencegraph/data/9ad281da-e352-4275-b1fa-6a3516a654c9',
      '@type': ['Activity', 'Reconstruction'],
    },
  },
  isPartOf: {
    '@id':
      'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/23d3d87e-94fe-4639-b5c8-a26a712587e6',
    '@type': 'Entity',
  },
  license: {
    '@id': 'https://creativecommons.org/licenses/by/4.0/',
    '@type': 'License',
  },
  name: 'tkb060126a2_ch3_bc_n_jh_100x_1',
  objectOfStudy: {
    '@id':
      'http://bbp.epfl.ch/neurosciencegraph/taxonomies/objectsofstudy/singlecells',
    '@type': 'ObjectOfStudy',
    label: 'Single Cell',
  },
  sameAs:
    'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/431a1196-47b5-41a2-931a-3577be9a2dc4',
  subject: {
    '@type': 'Subject',
    species: {
      '@id': 'NCBITaxon:10116',
      label: 'Rattus norvegicus',
    },
  },
  _constrainedBy: 'https://neuroshapes.org/dash/neuronmorphology',
  _createdAt: '2021-11-23T11:34:00.952Z',
  _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
  _deprecated: false,
  _incoming:
    'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/datashapes:neuronmorphology/neuronmorphologies%2Fbfdd4d1a-8b06-46fe-b663-7d9f8020dcaf/incoming',
  _outgoing:
    'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/datashapes:neuronmorphology/neuronmorphologies%2Fbfdd4d1a-8b06-46fe-b663-7d9f8020dcaf/outgoing',
  _project: 'https://bbp.epfl.ch/nexus/v1/projects/public/sscx',
  _rev: 2,
  _schemaProject:
    'https://bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
  _self:
    'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/datashapes:neuronmorphology/neuronmorphologies%2Fbfdd4d1a-8b06-46fe-b663-7d9f8020dcaf',
  _updatedAt: '2023-06-23T07:34:56.011Z',
  _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/cgonzale',
};
const resourceFromSearchApiId = 'https://www.grid.ac/institutes/grid.5333.6';
const resourceFromSearchApi = {
  '@context': [
    'https://bluebrain.github.io/nexus/contexts/metadata.json',
    'https://bluebrain.github.io/nexus/contexts/search.json',
    'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
  ],
  _total: 12,
  _results: [
    {
      '@id': 'https://www.grid.ac/institutes/grid.5333.6',
      '@type': [
        'http://schema.org/Organization',
        'http://www.w3.org/ns/prov#Entity',
      ],
      name: 'École Polytechnique Fédérale de Lausanne',
      _constrainedBy: 'https://neuroshapes.org/dash/organization',
      _createdAt: '2019-04-30T09:52:26.839Z',
      _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
      _deprecated: false,
      _incoming:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/somatosensorycortex/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/incoming',
      _outgoing:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/somatosensorycortex/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/outgoing',
      _project: 'https://bbp.epfl.ch/nexus/v1/projects/bbp/somatosensorycortex',
      _rev: 6,
      _schemaProject:
        'https://bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/somatosensorycortex/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6',
      _updatedAt: '2022-09-27T19:51:18.724Z',
      _updatedBy:
        'https://bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
    },
    {
      '@id': 'https://www.grid.ac/institutes/grid.5333.6',
      '@type': [
        'http://schema.org/Organization',
        'http://www.w3.org/ns/prov#Agent',
      ],
      name: 'École Polytechnique Fédérale de Lausanne',
      _constrainedBy: 'https://neuroshapes.org/dash/organization',
      _createdAt: '2019-09-04T13:16:26.008Z',
      _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/lurie',
      _deprecated: false,
      _incoming:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/incoming',
      _outgoing:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/outgoing',
      _project: 'https://bbp.epfl.ch/nexus/v1/projects/bbp/atlas',
      _rev: 1,
      _schemaProject:
        'https://bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/atlas/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6',
      _updatedAt: '2019-09-04T13:16:26.008Z',
      _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/lurie',
    },
    {
      '@id': 'https://www.grid.ac/institutes/grid.5333.6',
      '@type': [
        'http://schema.org/Organization',
        'http://www.w3.org/ns/prov#Agent',
      ],
      name: 'École Polytechnique Fédérale de Lausanne',
      _constrainedBy: 'https://neuroshapes.org/dash/organization',
      _createdAt: '2020-04-27T13:53:36.781Z',
      _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
      _deprecated: false,
      _incoming:
        'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/incoming',
      _outgoing:
        'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/outgoing',
      _project: 'https://bbp.epfl.ch/nexus/v1/projects/public/sscx',
      _rev: 2,
      _schemaProject:
        'https://bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6',
      _updatedAt: '2021-06-30T20:50:32.986Z',
      _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
    },
    {
      '@id': 'https://www.grid.ac/institutes/grid.5333.6',
      '@type': 'http://schema.org/Organization',
      name: 'École Polytechnique Fédérale de Lausanne',
      _constrainedBy: 'https://neuroshapes.org/dash/organization',
      _createdAt: '2020-06-15T13:49:11.099Z',
      _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
      _deprecated: false,
      _incoming:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/hippocampus/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/incoming',
      _outgoing:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/hippocampus/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/outgoing',
      _project: 'https://bbp.epfl.ch/nexus/v1/projects/bbp/hippocampus',
      _rev: 3,
      _schemaProject:
        'https://bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/hippocampus/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6',
      _updatedAt: '2022-09-27T19:47:26.049Z',
      _updatedBy:
        'https://bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
    },
    {
      '@id': 'https://www.grid.ac/institutes/grid.5333.6',
      '@type': [
        'http://schema.org/Organization',
        'http://www.w3.org/ns/prov#Agent',
      ],
      name: 'École Polytechnique Fédérale de Lausanne',
      _constrainedBy: 'https://neuroshapes.org/dash/organization',
      _createdAt: '2020-11-13T11:57:22.686Z',
      _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
      _deprecated: false,
      _incoming:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/agents/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/incoming',
      _outgoing:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/agents/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/outgoing',
      _project: 'https://bbp.epfl.ch/nexus/v1/projects/bbp/agents',
      _rev: 5,
      _schemaProject:
        'https://bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/agents/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6',
      _updatedAt: '2022-09-27T11:07:30.295Z',
      _updatedBy:
        'https://bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
    },
    {
      '@id': 'https://www.grid.ac/institutes/grid.5333.6',
      '@type': 'http://schema.org/Organization',
      name: 'École Polytechnique Fédérale de Lausanne',
      _constrainedBy: 'https://neuroshapes.org/dash/organization',
      _createdAt: '2021-03-12T13:35:36.413Z',
      _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
      _deprecated: false,
      _incoming:
        'https://bbp.epfl.ch/nexus/v1/resources/public/hippocampus/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/incoming',
      _outgoing:
        'https://bbp.epfl.ch/nexus/v1/resources/public/hippocampus/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/outgoing',
      _project: 'https://bbp.epfl.ch/nexus/v1/projects/public/hippocampus',
      _rev: 2,
      _schemaProject:
        'https://bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/public/hippocampus/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6',
      _updatedAt: '2021-12-15T14:22:37.998Z',
      _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
    },
    {
      '@id': 'https://www.grid.ac/institutes/grid.5333.6',
      '@type': [
        'http://schema.org/Organization',
        'http://www.w3.org/ns/prov#Agent',
      ],
      name: 'École Polytechnique Fédérale de Lausanne',
      _constrainedBy: 'https://neuroshapes.org/dash/organization',
      _createdAt: '2021-04-14T09:51:14.062Z',
      _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
      _deprecated: false,
      _incoming:
        'https://bbp.epfl.ch/nexus/v1/resources/public/thalamus/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/incoming',
      _outgoing:
        'https://bbp.epfl.ch/nexus/v1/resources/public/thalamus/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/outgoing',
      _project: 'https://bbp.epfl.ch/nexus/v1/projects/public/thalamus',
      _rev: 1,
      _schemaProject:
        'https://bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/public/thalamus/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6',
      _updatedAt: '2021-04-14T09:51:14.062Z',
      _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
    },
    {
      '@id': 'https://www.grid.ac/institutes/grid.5333.6',
      '@type': 'http://schema.org/Organization',
      name: 'École Polytechnique Fédérale de Lausanne',
      _constrainedBy: 'https://neuroshapes.org/dash/organization',
      _createdAt: '2021-05-17T09:02:10.654Z',
      _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
      _deprecated: false,
      _incoming:
        'https://bbp.epfl.ch/nexus/v1/resources/public/hippocampus-hub/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/incoming',
      _outgoing:
        'https://bbp.epfl.ch/nexus/v1/resources/public/hippocampus-hub/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/outgoing',
      _project: 'https://bbp.epfl.ch/nexus/v1/projects/public/hippocampus-hub',
      _rev: 2,
      _schemaProject:
        'https://bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/public/hippocampus-hub/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6',
      _updatedAt: '2021-12-01T09:25:04.144Z',
      _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
    },
    {
      '@id': 'https://www.grid.ac/institutes/grid.5333.6',
      '@type': 'http://schema.org/Organization',
      name: 'École Polytechnique Fédérale de Lausanne',
      _constrainedBy:
        'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
      _createdAt: '2021-06-17T11:36:24.449Z',
      _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
      _deprecated: false,
      _incoming:
        'https://bbp.epfl.ch/nexus/v1/resources/demo/bmo/_/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/incoming',
      _outgoing:
        'https://bbp.epfl.ch/nexus/v1/resources/demo/bmo/_/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/outgoing',
      _project: 'https://bbp.epfl.ch/nexus/v1/projects/demo/bmo',
      _rev: 1,
      _schemaProject: 'https://bbp.epfl.ch/nexus/v1/projects/demo/bmo',
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/demo/bmo/_/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6',
      _updatedAt: '2021-06-17T11:36:24.449Z',
      _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
    },
    {
      '@id': 'https://www.grid.ac/institutes/grid.5333.6',
      '@type': [
        'http://schema.org/Organization',
        'http://www.w3.org/ns/prov#Agent',
      ],
      name: 'École Polytechnique Fédérale de Lausanne',
      _constrainedBy: 'https://neuroshapes.org/dash/organization',
      _createdAt: '2022-02-25T11:26:25.968Z',
      _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
      _deprecated: false,
      _incoming:
        'https://bbp.epfl.ch/nexus/v1/resources/public/multi-vesicular-release/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/incoming',
      _outgoing:
        'https://bbp.epfl.ch/nexus/v1/resources/public/multi-vesicular-release/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/outgoing',
      _project:
        'https://bbp.epfl.ch/nexus/v1/projects/public/multi-vesicular-release',
      _rev: 1,
      _schemaProject:
        'https://bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/public/multi-vesicular-release/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6',
      _updatedAt: '2022-02-25T11:26:25.968Z',
      _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
    },
    {
      '@id': 'https://www.grid.ac/institutes/grid.5333.6',
      '@type': [
        'http://schema.org/Organization',
        'http://www.w3.org/ns/prov#Agent',
      ],
      name: 'École Polytechnique Fédérale de Lausanne',
      _constrainedBy: 'https://neuroshapes.org/dash/organization',
      _createdAt: '2022-12-15T13:00:11.386Z',
      _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/gevaert',
      _deprecated: false,
      _incoming:
        'https://bbp.epfl.ch/nexus/v1/resources/nse/test/https:%2F%2Fneuroshapes.org%2Fdash%2Forganization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/incoming',
      _outgoing:
        'https://bbp.epfl.ch/nexus/v1/resources/nse/test/https:%2F%2Fneuroshapes.org%2Fdash%2Forganization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/outgoing',
      _project: 'https://bbp.epfl.ch/nexus/v1/projects/nse/test',
      _rev: 1,
      _schemaProject:
        'https://bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/nse/test/https:%2F%2Fneuroshapes.org%2Fdash%2Forganization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6',
      _updatedAt: '2022-12-15T13:00:11.386Z',
      _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/gevaert',
    },
    {
      '@id': 'https://www.grid.ac/institutes/grid.5333.6',
      '@type': [
        'http://schema.org/Organization',
        'http://www.w3.org/ns/prov#Agent',
      ],
      name: 'École Polytechnique Fédérale de Lausanne',
      _constrainedBy: 'https://neuroshapes.org/dash/organization',
      _createdAt: '2023-01-03T08:26:33.743Z',
      _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/zisis',
      _deprecated: false,
      _incoming:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/mmb-point-neuron-framework-model/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/incoming',
      _outgoing:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/mmb-point-neuron-framework-model/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6/outgoing',
      _project:
        'https://bbp.epfl.ch/nexus/v1/projects/bbp/mmb-point-neuron-framework-model',
      _rev: 1,
      _schemaProject:
        'https://bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
      _self:
        'https://bbp.epfl.ch/nexus/v1/resources/bbp/mmb-point-neuron-framework-model/datashapes:organization/https:%2F%2Fwww.grid.ac%2Finstitutes%2Fgrid.5333.6',
      _updatedAt: '2023-01-03T08:26:33.743Z',
      _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/zisis',
    },
  ],
};

const getResolverResponseObject = rest.get(
  deltaPath(`resolvers/public/sscx/_/:id`),
  (req, res, ctx) => {
    const id = req.params.id;
    if (id === resourceResolverApiId) {
      return res(ctx.status(200), ctx.json(resourceResolverApi));
    }
    return res(ctx.status(400));
  }
);
const getSearchApiResponseObject = rest.get(
  deltaPath(`resources`),
  (req, res, ctx) => {
    const locate = req.url.searchParams.get('locate');
    if (locate && locate === resourceFromSearchApiId) {
      return res(ctx.status(200), ctx.json(resourceFromSearchApi));
    }
    return res(ctx.status(400));
  }
);

export {
  resourceResolverApi,
  resourceResolverApiId,
  resourceFromSearchApiId,
  resourceFromSearchApi,
  getResolverResponseObject,
  getSearchApiResponseObject,
};
