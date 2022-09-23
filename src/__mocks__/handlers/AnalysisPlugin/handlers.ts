import { rest } from 'msw';
import { deltaPath } from '__mocks__/handlers/handlers';
import sample1 from '../../../shared/components/AnalysisPlugin/sample-images/sample1.png';

export const sparqlAnalysisReportNoResultsHandler = rest.post(
  deltaPath('/views/:orgLabel/:projectLabel/graph/sparql'),
  (req, res, ctx) => {
    const mockResponse = {
      head: {
        vars: [
          'analysis_report_id',
          'analysis_report_name',
          'analysis_report_description',
          'analysis_report_categories',
          'analysis_report_types',
          'created_by',
          'created_at',
          'updated_by',
          'updated_at',
          'self',
        ],
      },
      results: { bindings: [] },
    };

    return res(ctx.status(200), ctx.json(mockResponse));
  }
);

export const sparqlAnalysisReportSingleResult = rest.post(
  deltaPath('/views/orgLabel/projectLabel/graph/sparql'),
  (req, res, ctx) => {
    const mockResponse = {
      head: {
        vars: [
          'container_resource_id',
          'container_resource_name',
          'analysis_report_id',
          'analysis_report_name',
          'analysis_report_categories',
          'analysis_report_types',
          'analysis_report_description',
          'created_by',
          'created_at',
          'updated_by',
          'updated_at',
          'self',
        ],
      },
      results: {
        bindings: [
          {
            analysis_report_description: {
              type: 'literal',
              value:
                "This is our analysis report. Isn't it great! Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. 555",
            },
            analysis_report_id: {
              type: 'uri',
              value:
                'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1',
            },
            analysis_report_name: {
              type: 'literal',
              value: 'Our Very First Analysis Report!',
            },
            analysis_report_categories: {
              type: 'array',
              value: ['Anatomical'],
            },
            analysis_report_types: {
              type: 'array',
              value: ['Analysis'],
            },
            container_resource_id: {
              type: 'uri',
              value:
                'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysis1',
            },
            container_resource_name: {
              type: 'literal',
              value: 'Analysis container',
            },
            created_at: {
              datatype: 'http://www.w3.org/2001/XMLSchema#dateTime',
              type: 'literal',
              value: '2022-06-17T04:14:06.357Z',
            },
            created_by: {
              type: 'uri',
              value:
                'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
            },
            updated_at: {
              datatype: 'http://www.w3.org/2001/XMLSchema#dateTime',
              type: 'literal',
              value: '2022-06-17T04:14:06.357Z',
            },
            updated_by: {
              type: 'uri',
              value:
                'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
            },
            self: {
              type: 'uri',
              value:
                'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1',
            },
          },
        ],
      },
    };

    return res(ctx.status(200), ctx.json(mockResponse));
  }
);

export const reportResource = rest.get(
  deltaPath(
    `resources/orgLabel/projectLabel/_/${encodeURIComponent(
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1'
    )}`
  ),
  (req, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        {
          '@vocab': 'https://neuroshapes.org/',
          nsg: 'https://neuroshapes.org/',
          nxv: 'https://bluebrain.github.io/nexus/vocabulary/',
          prov: 'http://www.w3.org/ns/prov#',
          schema: 'http://schema.org/',
        },
      ],
      '@id':
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1',
      '@type': 'AnalysisReport',
      hasPart: [
        {
          '@id':
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/d3d1cc48-9547-4c9c-a08f-f281ffb458cc',
          '@type': 'Entity',
          distribution: {
            '@type': 'DataDownload',
            contentSize: { unitCode: 'bytes', value: 60262 },
            contentUrl: {
              '@id':
                'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/d3d1cc48-9547-4c9c-a08f-f281ffb458cc',
            },
            digest: {
              algorithm: 'SHA-256',
              value:
                'caeaaba3e0b6db4ddd04d6c775521187e8309b15f60cd5c783afe4bf80fa347c',
            },
            encodingFormat: 'image/png',
          },
          name: 'insta_logo_large.png',
          description: 'some kind of description',
        },
      ],
      name: 'Derivation updated',
      'prov:derivation': {
        entity: {
          '@id':
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/TestAnalysisCaption',
        },
      },
      'schema:description': 'Analysis description sample 1',
      _constrainedBy:
        'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
      _createdAt: '2022-08-11T12:51:43.983Z',
      _createdBy:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
      _deprecated: false,
      _incoming:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1/incoming',
      _outgoing:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1/outgoing',
      _project:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/bbp-users/nicholas',
      _rev: 1,
      _schemaProject:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/bbp-users/nicholas',
      _self:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1',
      _updatedAt: '2022-08-11T12:51:43.983Z',
      _updatedBy:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
    };
    return res(ctx.status(200), ctx.json(mockResponse));
  }
);

export const imageResourceFile = rest.get(
  deltaPath(
    '/resources/orgLabel/projectLabel/_/https%3A%2F%2Fdev.nise.bbp.epfl.ch%2Fnexus%2Fv1%2Fresources%2Fbbp-users%2Fnicholas%2F_%2Fd3d1cc48-9547-4c9c-a08f-f281ffb458cc'
  ),
  (req, res, ctx) => {
    return res(ctx.status(200), ctx.body(sample1));
  }
);

export const pdfResourceFile = rest.get(
  deltaPath(
    'resources/orgLabel/projectLabel/_/https%3A%2F%2Fdev.nise.bbp.epfl.ch%2Fnexus%2Fv1%2Fresources%2Fbbp-users%2Fnicholas%2F_%2Fpdffile'
  ),
  (req, res, ctx) => {
    return res(ctx.status(200), ctx.body(sample1));
  }
);

export const resourcesAnalysisReportType = rest.post(
  deltaPath('/resources/orgLabel/projectLabel'),
  (req, res, ctx) => {
    const mockResponse = {
      '@context': 'https://bluebrain.github.io/nexus/contexts/metadata.json',
      '@id':
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/2098607b-30ae-493f-9e07-38f4822a0787',
      '@type': 'https://neuroshapes.org/AnalysisReport',
      _constrainedBy:
        'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
      _createdAt: '2022-06-29T12:34:49.183Z',
      _createdBy:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
      _deprecated: false,
      _incoming:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/2098607b-30ae-493f-9e07-38f4822a0787/incoming',
      _outgoing:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/2098607b-30ae-493f-9e07-38f4822a0787/outgoing',
      _project:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/bbp-users/nicholas',
      _rev: 1,
      _schemaProject:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/bbp-users/nicholas',
      _self:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/2098607b-30ae-493f-9e07-38f4822a0787',
      _updatedAt: '2022-06-29T12:34:49.183Z',
      _updatedBy:
        'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
    };

    return res(
      // Respond with a 200 status code
      ctx.status(200),
      ctx.json(mockResponse)
    );
  }
);
