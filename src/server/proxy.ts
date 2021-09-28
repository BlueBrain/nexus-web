const { createProxyMiddleware } = require('http-proxy-middleware');
import * as express from 'express';

function setUpDeltaProxy(app: express.Express, apiEndpoint: string) {
  const esResult = {
    hits: {
      hits: [
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/ca83203b-2658-43d7-88b9-a2b159087a17',
          _index:
            'delta_a285ec73-a0f4-4f83-af38-7edc0c7add8f_b8b3c096-8397-43d9-bf4a-5808c70b15eb_1',
          _score: 7.625246,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/ca83203b-2658-43d7-88b9-a2b159087a17',
            '@type': [
              'https://neuroshapes.org/ReconstructedCell',
              'https://bbp.epfl.ch/nexus/v1/resources/bbp_test/nwb_ephys/_/NeuronMorphology',
              'http://schema.org/Dataset',
              'http://www.w3.org/ns/prov#Entity',
            ],
            brainRegion: {
              identifier: 'http://purl.obolibrary.org/obo/UBERON_0014550',
              label: 'CA3_SP',
            },
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/akkaufma',
            name: 'CA3_040203_AM3_INT',
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/bbp_test/nwb_ephys',
              label: 'bbp_test/nwb_ephys',
            },
            subjectSpecies: {
              identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
              label: 'Rattus norvegicus',
            },
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/bbp_test/nwb_ephys/_/neuronmorphologies%2Fca83203b-2658-43d7-88b9-a2b159087a17',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/traces/2478cd2c-7f66-4e59-9c16-0de7cb70a4d0',
          _index:
            'delta_3943d686-bed4-48a3-8b14-b4413b899613_02bcaa27-7e33-4cc4-b240-ff218ff4eaae_1',
          _score: 5.0644674,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/traces/2478cd2c-7f66-4e59-9c16-0de7cb70a4d0',
            '@type': 'https://neuroshapes.org/Trace',
            brainRegion: {
              identifier:
                'http://api.brain-map.org/api/v2/data/Structure/12139',
              label: 'TemL',
            },
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            license: {
              identifier: 'https://alleninstitute.org/legal/terms-use/',
            },
            name: 'H16.03.005.01.09.01',
            organizations: [
              { identifier: 'https://www.grid.ac/institutes/grid.417881.3' },
            ],
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/dke/kgforge',
              label: 'dke/kgforge',
            },
            subjectSpecies: {
              'https://bluebrain.github.io/nexus/field/identifier':
                'Homo Sapiens',
            },
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/dke/kgforge/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Ftraces%2F2478cd2c-7f66-4e59-9c16-0de7cb70a4d0',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/2478cd2c-7f66-4e59-9c16-0de7cb70a4d0',
          _index:
            'delta_3943d686-bed4-48a3-8b14-b4413b899613_02bcaa27-7e33-4cc4-b240-ff218ff4eaae_1',
          _score: 5.0644674,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/2478cd2c-7f66-4e59-9c16-0de7cb70a4d0',
            '@type': 'https://neuroshapes.org/NeuronMorphology',
            brainRegion: {
              identifier:
                'http://api.brain-map.org/api/v2/data/Structure/12139',
              label: 'TemL',
            },
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            license: {
              identifier: 'https://alleninstitute.org/legal/terms-use/',
            },
            name: 'H16.03.005.01.09.01',
            organizations: [
              { identifier: 'https://www.grid.ac/institutes/grid.417881.3' },
            ],
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/dke/kgforge',
              label: 'dke/kgforge',
            },
            subjectSpecies: {
              'https://bluebrain.github.io/nexus/field/identifier':
                'Homo Sapiens',
            },
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/dke/kgforge/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fneuronmorphologies%2F2478cd2c-7f66-4e59-9c16-0de7cb70a4d0',
          },
          _type: '_doc',
        },
        {
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/traces/d720f9b8-511d-4b86-8363-208a48e485b8',
          _index:
            'delta_3943d686-bed4-48a3-8b14-b4413b899613_02bcaa27-7e33-4cc4-b240-ff218ff4eaae_1',
          _score: 5.0644674,
          _source: {
            '@id':
              'https://bbp.epfl.ch/neurosciencegraph/data/traces/d720f9b8-511d-4b86-8363-208a48e485b8',
            '@type': 'https://neuroshapes.org/Trace',
            brainRegion: {
              identifier:
                'http://api.brain-map.org/api/v2/data/Structure/12139',
              label: 'TemL',
            },
            createdBy:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/realms/bbp/users/sy',
            license: {
              identifier: 'https://alleninstitute.org/legal/terms-use/',
            },
            name: 'H16.03.005.01.09.01',
            organizations: [
              { identifier: 'https://www.grid.ac/institutes/grid.417881.3' },
            ],
            project: {
              identifier:
                'https://staging.nexus.ocp.bbp.epfl.ch/v1/projects/dke/kgforge',
              label: 'dke/kgforge',
            },
            subjectSpecies: {
              'https://bluebrain.github.io/nexus/field/identifier':
                'Homo Sapiens',
            },
            _self:
              'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/dke/kgforge/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Ftraces%2Fd720f9b8-511d-4b86-8363-208a48e485b8',
          },
          _type: '_doc',
        },
      ],
      max_score: 7.625246,
      total: { relation: 'eq', value: 27963 },
    },
    num_reduce_phases: 2,
    timed_out: false,
    took: 382,
    _shards: { failed: 0, skipped: 0, successful: 649, total: 649 },
  };

  type SearchConfig = {
    fields: (
      | {
          name: string;
          label: string;
          array: boolean;
          fields: { name: string; format: string }[];
          format?: undefined;
        }
      | {
          name: string;
          label: string;
          format: string;
          array: boolean;
          fields?: undefined;
        }
    )[];
  };

  const searchConfig: SearchConfig = {
    fields: [
      {
        name: 'project',
        label: 'Project',
        array: false,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
      {
        name: '@type',
        label: 'Types',
        format: 'uri',
        array: true,
      },
      {
        name: 'name',
        label: 'Name',
        array: false,
        format: 'text',
      },
      {
        name: 'description',
        label: 'Description',
        array: false,
        format: 'text',
      },
      {
        name: 'brainRegion',
        label: 'Brain Region',
        array: false,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
      {
        name: 'subjectSpecies',
        label: 'Subject Species',
        array: false,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
      {
        name: 'contributors',
        label: 'Contributors',
        array: true,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
      {
        name: 'organisations',
        label: 'Organisations',
        array: true,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
      {
        name: 'license',
        label: 'License',
        array: false,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
      {
        name: 'mType',
        label: 'M-Type',
        array: true,
        fields: [
          {
            name: 'identifier',
            format: 'uri',
          },
          {
            name: 'label',
            format: 'text',
          },
        ],
      },
    ],
  };

  const filter = function(pathname: string, req: express.Request) {
    const query =
      pathname.match('^/proxy/search/query') && req.method === 'POST';
    const config =
      pathname.match('^/proxy/search/config') && req.method === 'GET';
    if (query || config) {
      return false;
    }
    return true;
  };

  app.use(
    '/proxy',
    createProxyMiddleware(filter, {
      target: apiEndpoint,
      changeOrigin: true,
      pathRewrite: {
        [`^/proxy`]: '',
      },
    })
  );
  // search proxy
  app.get(
    `/proxy/search/config`,
    (req: express.Request, res: express.Response) => {
      res.send(JSON.stringify(searchConfig));
    }
  );

  // search query
  app.post(
    `/proxy/search/query`,
    (req: express.Request, res: express.Response) => {
      res.send(JSON.stringify(esResult));
    }
  );
}

export default setUpDeltaProxy;
