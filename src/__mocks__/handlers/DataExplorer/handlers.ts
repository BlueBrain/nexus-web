import { rest } from 'msw';
import { deltaPath } from '__mocks__/handlers/handlers';
import { Resource } from '@bbp/nexus-sdk';

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

export const getMockResource = (
  selfSuffix: string,
  extra: { [key: string]: any }
): Resource => ({
  '@id': `https://bbp.epfl.ch/neurosciencegraph/data/${selfSuffix}`,
  '@type':
    'https://bbp.epfl.ch/ontologies/core/bmo/SimulationCampaignConfiguration',
  _constrainedBy:
    'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
  _createdAt: '2023-06-21T09:39:47.217Z',
  _createdBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/antonel',
  _deprecated: false,
  _incoming: `https://bbp.epfl.ch/nexus/v1/resources/bbp/mmb-point-neuron-framework-model/_/${selfSuffix}/incoming`,
  _outgoing: `https://bbp.epfl.ch/nexus/v1/resources/bbp/mmb-point-neuron-framework-model/_/${selfSuffix}/outgoing`,
  _project:
    'https://bbp.epfl.ch/nexus/v1/projects/bbp/mmb-point-neuron-framework-model',
  _rev: 2,
  _self: `https://bbp.epfl.ch/nexus/v1/resources/bbp/mmb-point-neuron-framework-model/_/${selfSuffix}`,
  _updatedAt: '2023-06-21T09:39:47.844Z',
  _updatedBy: 'https://bbp.epfl.ch/nexus/v1/realms/bbp/users/antonel',
  ...extra,
});

export const defaultMockResult: Resource[] = [
  getMockResource('self1', {}),
  getMockResource('self2', { specialProperty: 'superSpecialValue' }),
  getMockResource('self3', { specialProperty: ['superSpecialValue'] }),
  getMockResource('self4', { specialProperty: '' }),
  getMockResource('self5', { specialProperty: [] }),
  getMockResource('self6', {
    specialProperty: ['superSpecialValue', 'so'],
  }),
  getMockResource('self7', { specialProperty: { foo: 1, bar: 2 } }),
  getMockResource('self8', { specialProperty: null }),
  getMockResource('self9', { specialProperty: {} }),
  getMockResource('self10', {}),
];
