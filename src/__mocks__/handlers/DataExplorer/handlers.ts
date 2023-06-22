import { rest } from 'msw';
import { deltaPath } from '__mocks__/handlers/handlers';
import { Project, Resource } from '@bbp/nexus-sdk';

export const dataExplorerPageHandler = (mockReources: Resource[]) =>
  rest.get(deltaPath(`/resources`), (req, res, ctx) => {
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrain.github.io/nexus/contexts/search.json',
        'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
      ],
      _total: 300,
      _results: mockReources,
      _next:
        'https://bbp.epfl.ch/nexus/v1/resources?size=50&sort=@id&after=%5B1687269183553,%22https://bbp.epfl.ch/neurosciencegraph/data/31e22529-2c36-44f0-9158-193eb50526cd%22%5D',
    };
    return res(ctx.status(200), ctx.json(mockResponse));
  });

export const filterByProjectHandler = (mockReources: Resource[]) =>
  rest.get(deltaPath(`/resources/:org/:project`), (req, res, ctx) => {
    const { project } = req.params;

    const responseBody = project
      ? mockReources.filter(
          res =>
            res._project.slice(res._project.lastIndexOf('/') + 1) === project
        )
      : mockReources;
    const mockResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrain.github.io/nexus/contexts/search.json',
        'https://bluebrain.github.io/nexus/contexts/search-metadata.json',
      ],
      _total: 300,
      _results: responseBody,
      _next:
        'https://bbp.epfl.ch/nexus/v1/resources?size=50&sort=@id&after=%5B1687269183553,%22https://bbp.epfl.ch/neurosciencegraph/data/31e22529-2c36-44f0-9158-193eb50526cd%22%5D',
    };
    return res(ctx.status(200), ctx.json(mockResponse));
  });

export const getProjectHandler = () =>
  rest.get(deltaPath(`/projects`), (req, res, ctx) => {
    const projectResponse = {
      '@context': [
        'https://bluebrain.github.io/nexus/contexts/metadata.json',
        'https://bluebrain.github.io/nexus/contexts/search.json',
        'https://bluebrain.github.io/nexus/contexts/projects.json',
      ],
      _next:
        'https://bbp.epfl.ch/nexus/v1/projects?from=10&label=&size=10&sort=_label',
      _total: 10,
      _results: [
        getMockProject('something-brainy', 'bbp'),

        getMockProject('smarty', 'bbp'),

        getMockProject('unhcr', 'un'),
        getMockProject('unicef', 'un'),
        getMockProject('tellytubbies', 'bbc'),
      ],
    };
    return res(ctx.status(200), ctx.json(projectResponse));
  });

const getMockProject = (project: string, org: string = 'bbp'): Project => {
  return {
    '@id': `https://bbp.epfl.ch/nexus/v1/projects/bbp/${project}`,
    '@type': 'Project',
    apiMappings: [
      {
        namespace: 'https://neuroshapes.org/dash/',
        prefix: 'datashapes',
      },
    ],
    '@context': ['mockcontext'],
    base: 'https://bbp.epfl.ch/neurosciencegraph/data/',
    description: 'This is such a dumb mock project. dumb dumb dumb.',
    vocab:
      'https://bbp.epfl.ch/nexus/v1/resources/bbp/Blue-Brain-Ketogenic-Project-(BBK)/_/',
    _constrainedBy: 'https://bluebrain.github.io/nexus/schemas/projects.json',
    _createdAt: '2021-03-04T21:27:18.900Z',
    _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/harikris',
    _deprecated: true,
    _label: `${project}`,
    _organizationLabel: org,
    _organizationUuid: 'a605b71a-377d-4df3-95f8-923149d04106',
    _rev: 2,
    _self: `https://bbp.epfl.ch/nexus/v1/projects/bbp/${project}`,
    _updatedAt: '2021-03-15T09:05:05.882Z',
    _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/harikris',
  };
};

export const getMockResource = (
  selfSuffix: string,
  extra: { [key: string]: any },
  project: string = 'hippocampus'
): Resource => ({
  '@id': `https://bbp.epfl.ch/neurosciencegraph/data/${selfSuffix}`,
  '@type':
    'https://bbp.epfl.ch/ontologies/core/bmo/SimulationCampaignConfiguration',
  _constrainedBy:
    'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
  _createdAt: '2023-06-21T09:39:47.217Z',
  _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/antonel',
  _deprecated: false,
  _incoming: `https://bbp.epfl.ch/nexus/v1/resources/bbp/${project}/_/${selfSuffix}/incoming`,
  _outgoing: `https://bbp.epfl.ch/nexus/v1/resources/bbp/${project}/_/${selfSuffix}/outgoing`,
  _project: `https://bbp.epfl.ch/nexus/v1/projects/bbp/${project}`,
  _rev: 2,
  _self: `https://bbp.epfl.ch/nexus/v1/resources/bbp/${project}/_/${selfSuffix}`,
  _updatedAt: '2023-06-21T09:39:47.844Z',
  _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/antonel',
  ...extra,
});

export const defaultMockResult: Resource[] = [
  getMockResource('self1', {}),
  getMockResource('self2', { specialProperty: 'superSpecialValue' }, 'unhcr'),
  getMockResource('self3', { specialProperty: ['superSpecialValue'] }),
  getMockResource('self4', { specialProperty: '' }),
  getMockResource('self5', { specialProperty: [] }),
  getMockResource('self6', {
    specialProperty: ['superSpecialValue', 'so'],
  }),
  getMockResource('self7', { specialProperty: { foo: 1, bar: 2 } }, 'unhcr'),
  getMockResource('self8', { specialProperty: null }),
  getMockResource('self9', { specialProperty: {} }),
  getMockResource('self10', {}),
];
