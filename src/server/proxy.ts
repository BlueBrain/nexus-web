const { createProxyMiddleware } = require('http-proxy-middleware');
import * as express from 'express';

function setUpDeltaProxy(app: express.Express, apiEndpoint: string) {
  const esResult = {
    hits: {
      hits: [
        {
          _type: '_doc',
          sort: [1627390182151],
          _id:
            'https://bbp.epfl.ch/neurosciencegraph/data/d52e34bd-5f62-495a-9e5c-b2d3afa33017',
          _index: 'delta_3c07805d-0818-4eaf-8af4-91daa452268d_2',
          _source: {
            project: {
              identifier: 'http://example.org/subjectSpecies',
              label: 'Project',
            },
            '@type': ['a', 'b', 'c', 'd'],
            name: 'A Resource',
            description: 'Description',
            subjectSpecies: {
              identifier: 'http://example.org/subjectSpecies',
              label: 'Subject Species',
            },
            brainRegion: {
              identifier: 'http://example.org/subjectSpecies',
              label: 'Brain Region',
            },
            contributors: [
              {
                identifier: 'http://example.org/subjectSpecies',
                label: 'James Bond',
              },
              {
                identifier: 'http://example.org/subjectSpecies',
                label: 'Jason Bourne',
              },
            ],
            organisations: [
              {
                identifier: 'http://example.org/subjectSpecies',
                label: 'MI6',
              },
              {
                identifier: 'http://example.org/subjectSpecies',
                label: 'CIA',
              },
            ],
            license: {
              identifier: 'http://example.org/subjectSpecies',
              label: 'License to Kill',
            },
            mType: [
              {
                identifier: 'http://example.org/subjectSpecies',
                label: 'mType1',
              },
              {
                identifier: 'http://example.org/subjectSpecies',
                label: 'mType2',
              },
            ],
          },
        },
      ],
      max_score: 0.03460473,
      total: {
        relation: 'eq',
        value: 115739,
      },
    },
    timed_out: false,
    took: 8,
    _shards: {
      failed: 0,
      skipped: 0,
      successful: 1,
      total: 1,
    },
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
