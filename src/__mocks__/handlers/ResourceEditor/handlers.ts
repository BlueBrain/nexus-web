import { rest } from 'msw';
import { deltaPath } from '__mocks__/handlers/handlers';

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

const objectOfStudy = {
  '@context': [
    'https://bluebrain.github.io/nexus/contexts/metadata.json',
    'https://bbp.neuroshapes.org',
  ],
  '@id':
    'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/23d3d87e-94fe-4639-b5c8-a26a712587e6',
  '@type': ['Dataset', 'NeuronMorphology'],
  annotation: {
    '@type': ['MType:Annotation', 'Annotation'],
    hasBody: {
      '@id': 'http://uri.interlex.org/base/ilx_0383236',
      '@type': ['AnnotationBody', 'MType'],
      label: 'L6_SBC',
      prefLabel: 'Layer 6 Small Basket Cell',
    },
    name: 'M-type Annotation',
  },
  brainLocation: {
    '@type': 'BrainLocation',
    brainRegion: {
      '@id': 'UBERON:0008933',
      label: 'primary somatosensory cortex',
    },
    layer: {
      '@id': 'UBERON:0005395',
      label: 'layer 6',
    },
  },
  contribution: {
    '@type': 'Contribution',
    agent: {
      '@id': 'https://www.grid.ac/institutes/grid.5333.6',
      '@type': 'Agent',
    },
  },
  description:
    'This dataset contains in vitro-filled neuron morphologies from layer 6 with m-type L6_SBC. The dataset contains one distribution of the neuron morphologies in ZIP file format. The ZIP file contains the experimental neuron morphologies in ASC and in SWC file format.',
  distribution: {
    '@type': 'DataDownload',
    atLocation: {
      '@type': 'Location',
      location:
        'file:///gpfs/bbp.cscs.ch/data/project/proj109/nexus/public/sscx/8/7/7/8/7/e/a/1/invitro_L6_SBC.zip',
      store: {
        '@id':
          'https://bbp.epfl.ch/neurosciencegraph/data/4820323e-bee0-48d2-824f-9d9d404dbbee',
      },
    },
    contentSize: {
      unitCode: 'bytes',
      value: 1431072,
    },
    contentUrl:
      'https://bbp.epfl.ch/nexus/v1/files/public/sscx/0fb6d6f9-a830-4114-b6ea-cc797f56ce1a',
    digest: {
      algorithm: 'SHA-256',
      value: '12c389a768252dd251f365d3bdda6367f7bbafd0d515c396636e52ceca18850f',
    },
    encodingFormat: 'application/zip',
    name: 'invitro_L6_SBC.zip',
  },
  hasPart: [
    {
      '@id':
        'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/cbbb48b2-d258-4626-9fef-63c32fd692bf',
      '@type': ['NeuronMorphology', 'Entity'],
      distribution: [
        {
          contentUrl:
            'https://bbp.epfl.ch/nexus/v1/files/public/sscx/68795bc2-772c-425c-b76c-b171e345dda8',
        },
        {
          contentUrl:
            'https://bbp.epfl.ch/nexus/v1/files/public/sscx/a26fc0fb-e6be-485c-ba63-014ac8c3bee4',
        },
      ],
      name: 'rp110125_L5-1_idC',
    },
    {
      '@id':
        'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/38e7469b-89c6-4213-8fe1-5fd2eeaa597b',
      '@type': ['NeuronMorphology', 'Entity'],
      distribution: [
        {
          contentUrl:
            'https://bbp.epfl.ch/nexus/v1/files/public/sscx/e1ce4a09-8aa5-4204-b889-15b479416993',
        },
        {
          contentUrl:
            'https://bbp.epfl.ch/nexus/v1/files/public/sscx/382f3300-6f2c-43f2-b456-479ded2ce20e',
        },
      ],
      name: 'rp110120_L5-4_idB',
    },
    {
      '@id':
        'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/8304e7af-de34-433e-a362-26518fc6edd6',
      '@type': ['NeuronMorphology', 'Entity'],
      distribution: [
        {
          contentUrl:
            'https://bbp.epfl.ch/nexus/v1/files/public/sscx/15b402f7-c94e-47d7-8678-86914a54fcb1',
        },
        {
          contentUrl:
            'https://bbp.epfl.ch/nexus/v1/files/public/sscx/3aed62da-c4cb-42bf-9f01-691c7f22b151',
        },
      ],
      name: 'tkb060126a2_ch3_bc_n_jh_100x_1',
    },
    {
      '@id':
        'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/3c580d32-2e76-47db-a340-ff09b0fd0199',
      '@type': ['NeuronMorphology', 'Entity'],
      distribution: [
        {
          contentUrl:
            'https://bbp.epfl.ch/nexus/v1/files/public/sscx/e2868f5d-a789-4b73-9fc5-296996c1eb68',
        },
        {
          contentUrl:
            'https://bbp.epfl.ch/nexus/v1/files/public/sscx/9b09a6ce-09eb-430d-9a62-769815460257',
        },
      ],
      name: 'rp100428-12_idK',
    },
    {
      '@id':
        'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/70e1112d-3889-4e80-9333-c09cf1c252d4',
      '@type': ['Entity', 'NeuronMorphology'],
      distribution: [
        {
          contentUrl:
            'https://bbp.epfl.ch/nexus/v1/files/public/sscx/b51547a1-d341-409d-ace5-7e28e12d26d4',
        },
        {
          contentUrl:
            'https://bbp.epfl.ch/nexus/v1/files/public/sscx/8e0332e0-b89c-4690-8998-d69ce4cdaea8',
        },
      ],
      name: 'rp110119_L5-2_idC',
    },
  ],
  license: {
    '@id':
      'https://bbp.epfl.ch/neurosciencegraph/data/licenses/97521f71-605d-4f42-8f1b-c37e742a30bf',
    '@type': 'License',
  },
  name: 'In vitro-filled neuron morphologies from layer 6 with m-type L6_SBC',
  objectOfStudy: {
    '@id':
      'http://bbp.epfl.ch/neurosciencegraph/taxonomies/objectsofstudy/singlecells',
    '@type': 'ObjectOfStudy',
    label: 'Single Cell',
  },
  subject: {
    '@type': 'Subject',
    species: {
      '@id': 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
      label: 'Rattus norvegicus',
    },
  },
  _constrainedBy: 'https://neuroshapes.org/dash/dataset',
  _createdAt: '2020-03-09T09:03:23.680Z',
  _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/akkaufma',
  _deprecated: true,
  _incoming:
    'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/datashapes:dataset/neuronmorphologies%2F23d3d87e-94fe-4639-b5c8-a26a712587e6/incoming',
  _outgoing:
    'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/datashapes:dataset/neuronmorphologies%2F23d3d87e-94fe-4639-b5c8-a26a712587e6/outgoing',
  _project: 'https://bbp.epfl.ch/nexus/v1/projects/public/sscx',
  _rev: 9,
  _schemaProject: 'https://bbp.epfl.ch/nexus/v1/projects/public/sscx',
  _self:
    'https://bbp.epfl.ch/nexus/v1/resources/public/sscx/datashapes:dataset/neuronmorphologies%2F23d3d87e-94fe-4639-b5c8-a26a712587e6',
  _updatedAt: '2021-11-04T11:45:59.645Z',
  _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/arnaudon',
};

const getResolverResponseForobjectOfStudy = rest.get(
  deltaPath(
    `resolvers/public/sscx/${encodeURIComponent(resource.objectOfStudy['@id'])}`
  ),
  (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(objectOfStudy));
  }
);

export { resource, getResolverResponseForobjectOfStudy };
