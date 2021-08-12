const { createProxyMiddleware } = require('http-proxy-middleware');
import * as express from 'express';
import * as data from './many.json';
function setUpDeltaProxy(app: express.Express, apiEndpoint: string) {
  const esResult = {
    hits: {
      hits: data,
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
      successful: 35,
      total: 35,
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
