import { rest } from 'msw';
import { deltaPath } from '__mocks__/handlers/handlers';
import { getMockResource } from '../DataExplorer/handlers';

const resource = {
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

const initialResource = getMockResource(
  'neuronmorphologies/bfdd4d1a-8b06-46fe-b663-7d9f8020dcaf',
  {
    '@context': [
      'https://bluebrain.github.io/nexus/contexts/metadata.json',
      'https://bbp.neuroshapes.org',
    ],
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
    name: 'initial-resource',
  }
);

const initialResourceExpanded = {
  '@id':
    'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/bfdd4d1a-8b06-46fe-b663-7d9f8020dcaf',
  '@type': [
    'http://www.w3.org/ns/prov#Entity',
    'http://schema.org/Dataset',
    'https://neuroshapes.org/NeuronMorphology',
    'https://neuroshapes.org/ReconstructedCell',
  ],
  'http://schema.org/description': [
    {
      '@value':
        'This dataset is about an in vitro-filled neuron morphology from layer 6 with m-type L6_SBC. The distribution contains the neuron morphology in ASC and in SWC file format.',
    },
  ],
  'http://schema.org/distribution': [
    {
      '@type': ['http://schema.org/DataDownload'],
      'http://schema.org/contentSize': [
        {
          'http://schema.org/unitCode': [
            {
              '@value': 'bytes',
            },
          ],
          'http://schema.org/value': [
            {
              '@value': 1097726,
            },
          ],
        },
      ],
      'http://schema.org/contentUrl': [
        {
          '@id':
            'https://bbp.epfl.ch/nexus/v1/files/public/sscx/https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fbf146eaf-48cf-4b83-b375-bbb92ce7f7c0',
        },
      ],
      'http://schema.org/encodingFormat': [
        {
          '@value': 'application/asc',
        },
      ],
      'http://schema.org/name': [
        {
          '@value': 'tkb060126a2_ch3_bc_n_jh_100x_1.asc',
        },
      ],
      'http://www.w3.org/ns/prov#atLocation': [
        {
          '@type': ['http://www.w3.org/ns/prov#Location'],
          'https://neuroshapes.org/location': [
            {
              '@value':
                'file:///gpfs/bbp.cscs.ch/data/project/proj109/nexus/c7d70522-4305-480a-b190-75d757ed9a49/a/a/e/d/8/2/b/5/tkb060126a2_ch3_bc_n_jh_100x_1.asc',
            },
          ],
          'https://neuroshapes.org/store': [
            {
              '@id':
                'https://bbp.epfl.ch/neurosciencegraph/data/4820323e-bee0-48d2-824f-9d9d404dbbee',
              '@type': [
                'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/_/RemoteDiskStorage',
              ],
              'https://bluebrain.github.io/nexus/vocabulary/rev': [
                {
                  '@value': 1,
                },
              ],
            },
          ],
        },
      ],
      'https://neuroshapes.org/digest': [
        {
          'http://schema.org/algorithm': [
            {
              '@value': 'SHA-256',
            },
          ],
          'http://schema.org/value': [
            {
              '@value':
                'efcf3d6660d9769b3f3066e874c8f13536fbc398b5605ffc5acc223884362ff6',
            },
          ],
        },
      ],
    },
    {
      '@type': ['http://schema.org/DataDownload'],
      'http://schema.org/contentSize': [
        {
          'http://schema.org/unitCode': [
            {
              '@value': 'bytes',
            },
          ],
          'http://schema.org/value': [
            {
              '@value': 891821,
            },
          ],
        },
      ],
      'http://schema.org/contentUrl': [
        {
          '@id':
            'https://bbp.epfl.ch/nexus/v1/files/public/sscx/https%3A%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F60025362-1ca8-425e-908c-a01e4661c3e7',
        },
      ],
      'http://schema.org/encodingFormat': [
        {
          '@value': 'application/swc',
        },
      ],
      'http://schema.org/name': [
        {
          '@value': 'tkb060126a2_ch3_bc_n_jh_100x_1.swc',
        },
      ],
      'http://www.w3.org/ns/prov#atLocation': [
        {
          '@type': ['http://www.w3.org/ns/prov#Location'],
          'https://neuroshapes.org/location': [
            {
              '@value':
                'file:///gpfs/bbp.cscs.ch/data/project/proj109/nexus/c7d70522-4305-480a-b190-75d757ed9a49/6/4/3/8/3/d/0/3/tkb060126a2_ch3_bc_n_jh_100x_1.swc',
            },
          ],
          'https://neuroshapes.org/store': [
            {
              '@id':
                'https://bbp.epfl.ch/neurosciencegraph/data/4820323e-bee0-48d2-824f-9d9d404dbbee',
              '@type': [
                'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/_/RemoteDiskStorage',
              ],
              'https://bluebrain.github.io/nexus/vocabulary/rev': [
                {
                  '@value': 1,
                },
              ],
            },
          ],
        },
      ],
      'https://neuroshapes.org/digest': [
        {
          'http://schema.org/algorithm': [
            {
              '@value': 'SHA-256',
            },
          ],
          'http://schema.org/value': [
            {
              '@value':
                '22bac983b129fe806c80a9ddb4dcf77b79c1a6a28adffd6674290fb1f014a30e',
            },
          ],
        },
      ],
    },
  ],
  'http://schema.org/isPartOf': [
    {
      '@id':
        'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/23d3d87e-94fe-4639-b5c8-a26a712587e6',
      '@type': ['http://www.w3.org/ns/prov#Entity'],
    },
  ],
  'http://schema.org/license': [
    {
      '@id': 'https://creativecommons.org/licenses/by/4.0/',
      '@type': ['https://neuroshapes.org/License'],
    },
  ],
  'http://schema.org/name': [
    {
      '@value': 'tkb060126a2_ch3_bc_n_jh_100x_1',
    },
  ],
  'http://schema.org/sameAs': [
    {
      '@id':
        'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/431a1196-47b5-41a2-931a-3577be9a2dc4',
    },
  ],
  'https://bluebrain.github.io/nexus/vocabulary/constrainedBy': [
    {
      '@id': 'https://neuroshapes.org/dash/neuronmorphology',
    },
  ],
  'https://bluebrain.github.io/nexus/vocabulary/createdAt': [
    {
      '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
      '@value': '2021-11-23T11:34:00.952Z',
    },
  ],
  'https://bluebrain.github.io/nexus/vocabulary/createdBy': [
    {
      '@id': 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
    },
  ],
  'https://bluebrain.github.io/nexus/vocabulary/deprecated': [
    {
      '@value': false,
    },
  ],
  'https://bluebrain.github.io/nexus/vocabulary/incoming': [
    {
      '@id':
        'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/datashapes:neuronmorphology/neuronmorphologies%2Fbfdd4d1a-8b06-46fe-b663-7d9f8020dcaf/incoming',
    },
  ],
  'https://bluebrain.github.io/nexus/vocabulary/outgoing': [
    {
      '@id':
        'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/datashapes:neuronmorphology/neuronmorphologies%2Fbfdd4d1a-8b06-46fe-b663-7d9f8020dcaf/outgoing',
    },
  ],
  'https://bluebrain.github.io/nexus/vocabulary/project': [
    {
      '@id': 'https://bbp.epfl.ch/nexus/v1/projects/public/sscx',
    },
  ],
  'https://bluebrain.github.io/nexus/vocabulary/rev': [
    {
      '@value': 2,
    },
  ],
  'https://bluebrain.github.io/nexus/vocabulary/schemaProject': [
    {
      '@id':
        'https://bbp.epfl.ch/nexus/v1/projects/neurosciencegraph/datamodels',
    },
  ],
  'https://bluebrain.github.io/nexus/vocabulary/self': [
    {
      '@id':
        'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/datashapes:neuronmorphology/neuronmorphologies%2Fbfdd4d1a-8b06-46fe-b663-7d9f8020dcaf',
    },
  ],
  'https://bluebrain.github.io/nexus/vocabulary/updatedAt': [
    {
      '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
      '@value': '2023-06-23T07:34:56.011Z',
    },
  ],
  'https://bluebrain.github.io/nexus/vocabulary/updatedBy': [
    {
      '@id': 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/cgonzale',
    },
  ],
  'https://neuroshapes.org/annotation': [
    {
      '@type': [
        'https://neuroshapes.org/MTypeAnnotation',
        'https://neuroshapes.org/Annotation',
      ],
      'http://schema.org/name': [
        {
          '@value': 'M-type Annotation',
        },
      ],
      'https://neuroshapes.org/hasBody': [
        {
          '@id': 'http://uri.interlex.org/base/ilx_0383236',
          '@type': [
            'https://neuroshapes.org/MType',
            'https://neuroshapes.org/AnnotationBody',
          ],
          'http://www.w3.org/2000/01/rdf-schema#label': [
            {
              '@value': 'L6_SBC',
            },
          ],
        },
      ],
    },
  ],
  'https://neuroshapes.org/brainLocation': [
    {
      '@type': ['https://neuroshapes.org/BrainLocation'],
      'https://neuroshapes.org/brainRegion': [
        {
          '@id': 'http://purl.obolibrary.org/obo/UBERON_0008933',
          'http://www.w3.org/2000/01/rdf-schema#label': [
            {
              '@value': 'primary somatosensory cortex',
            },
          ],
        },
      ],
      'https://neuroshapes.org/layer': [
        {
          '@id': 'http://purl.obolibrary.org/obo/UBERON_0005395',
          'http://www.w3.org/2000/01/rdf-schema#label': [
            {
              '@value': 'layer 6',
            },
          ],
        },
      ],
    },
  ],
  'https://neuroshapes.org/contribution': [
    {
      '@type': ['https://neuroshapes.org/Contribution'],
      'http://www.w3.org/ns/prov#agent': [
        {
          '@id': 'https://orcid.org/0000-0001-9358-1315',
          '@type': ['http://www.w3.org/ns/prov#Agent'],
        },
      ],
      'http://www.w3.org/ns/prov#hadRole': [
        {
          '@id': 'https://neuroshapes.org/NeuronElectrophysiologyRecordingRole',
          'http://www.w3.org/2000/01/rdf-schema#label': [
            {
              '@value': 'neuron electrophysiology recording role',
            },
          ],
        },
      ],
    },
    {
      '@type': ['https://neuroshapes.org/Contribution'],
      'http://www.w3.org/ns/prov#agent': [
        {
          '@id': 'https://www.grid.ac/institutes/grid.5333.6',
          '@type': ['http://www.w3.org/ns/prov#Agent'],
        },
      ],
    },
  ],
  'https://neuroshapes.org/derivation': [
    {
      '@type': ['http://www.w3.org/ns/prov#Derivation'],
      'http://www.w3.org/ns/prov#entity': [
        {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/350bcafe-9cbb-4c15-bad3-1caed2cbb990',
          '@type': [
            'https://neuroshapes.org/PatchedCell',
            'http://www.w3.org/ns/prov#Entity',
          ],
        },
      ],
    },
  ],
  'https://neuroshapes.org/generation': [
    {
      '@type': ['http://www.w3.org/ns/prov#Generation'],
      'http://www.w3.org/ns/prov#activity': [
        {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/9ad281da-e352-4275-b1fa-6a3516a654c9',
          '@type': [
            'http://www.w3.org/ns/prov#Activity',
            'https://neuroshapes.org/Reconstruction',
          ],
        },
      ],
    },
  ],
  'https://neuroshapes.org/objectOfStudy': [
    {
      '@id':
        'http://bbp.epfl.ch/neurosciencegraph/taxonomies/objectsofstudy/singlecells',
      '@type': ['https://neuroshapes.org/ObjectOfStudy'],
      'http://www.w3.org/2000/01/rdf-schema#label': [
        {
          '@value': 'Single Cell',
        },
      ],
    },
  ],
  'https://neuroshapes.org/subject': [
    {
      '@type': ['https://neuroshapes.org/Subject'],
      'https://neuroshapes.org/species': [
        {
          '@id': 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
          'http://www.w3.org/2000/01/rdf-schema#label': [
            {
              '@value': 'Rattus norvegicus',
            },
          ],
        },
      ],
    },
  ],
};

const getDataExplorerGraphFlowResourceObject = rest.get(
  deltaPath(
    `resources/public/sscx/_/${encodeURIComponent(initialResource['@id'])}`
  ),
  (req, res, ctx) => {
    const format = req.url.searchParams.get('format');
    if (format === 'expanded') {
      return res(ctx.status(200), ctx.json([initialResourceExpanded]));
    }
    return res(ctx.status(200), ctx.json(initialResource));
  }
);

const getDataExplorerGraphFlowResourceSource = rest.get(
  deltaPath(
    `resources/public/sscx/_/${encodeURIComponent(
      initialResource['@id']
    )}/source`
  ),
  (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(initialResource));
  }
);

const getDataExplorerGraphFlowResourceObjectTags = rest.get(
  deltaPath(
    `resources/public/sscx/_/${encodeURIComponent(initialResource['@id'])}/tags`
  ),
  (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        '@context': 'https://bluebrain.github.io/nexus/contexts/tags.json',
        tags: [],
      })
    );
  }
);

export {
  resource,
  initialResource,
  getDataExplorerGraphFlowResourceObject,
  getDataExplorerGraphFlowResourceObjectTags,
  getDataExplorerGraphFlowResourceSource,
};
