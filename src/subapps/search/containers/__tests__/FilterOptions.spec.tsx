import { vi } from 'vitest';
import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import fetch from 'node-fetch';
import {
  render,
  fireEvent,
  screen,
  server,
  within,
} from '../../../../utils/testUtil';
import { rest } from 'msw';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import FilterOptions from '../FilterOptions';
import { ConfigField } from 'subapps/search/hooks/useGlobalSearch';

const mockFiltersResponse = {
  aggregations: {
    '(missing)': { doc_count: 0 },
    suggestions: {
      buckets: [
        { doc_count: 12753, key: 'copies/sscx' },
        { doc_count: 443, key: 'copies/thalamus' },
        { doc_count: 256, key: 'copies/hippocampus' },
        { doc_count: 45, key: 'copies/hippocampus-hub' },
        { doc_count: 3, key: 'copies/ngv-anatomy' },
        { doc_count: 1, key: 'copies/topological-sampling' },
      ],
      doc_count_error_upper_bound: 0,
      sum_other_doc_count: 0,
    },
  },
  hits: {
    hits: [
      {
        _id:
          'https://bbp.epfl.ch/neurosciencegraph/data/subjects/3c237eda-c12a-432c-80bd-10ae4c909bf5',
        _index:
          'delta_search_27d56f04-82d5-4ae7-92d9-057e620deddc_960c5f7c-c5fa-4c3f-9a7a-1927b5250714_1',
        _score: 1.0,
        _source: {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/subjects/3c237eda-c12a-432c-80bd-10ae4c909bf5',
          '@type': 'https://neuroshapes.org/Subject',
          createdAt: '2022-04-01T09:14:15.673Z',
          createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          deprecated: false,
          name: 'ID 00575811',
          project: {
            identifier:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/hippocampus-hub',
            label: 'copies/hippocampus-hub',
          },
          updatedAt: '2022-04-01T09:14:15.673Z',
          updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/hippocampus-hub/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fsubjects%2F3c237eda-c12a-432c-80bd-10ae4c909bf5',
        },
        _type: '_doc',
      },
      {
        _id:
          'https://bbp.epfl.ch/neurosciencegraph/data/subjects/ddc23e1c-b83a-42ac-a44c-fca5710492fa',
        _index:
          'delta_search_27d56f04-82d5-4ae7-92d9-057e620deddc_960c5f7c-c5fa-4c3f-9a7a-1927b5250714_1',
        _score: 1.0,
        _source: {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/subjects/ddc23e1c-b83a-42ac-a44c-fca5710492fa',
          '@type': 'https://neuroshapes.org/Subject',
          createdAt: '2022-04-01T09:14:15.674Z',
          createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          deprecated: false,
          name: 'oh140807',
          project: {
            identifier:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/hippocampus-hub',
            label: 'copies/hippocampus-hub',
          },
          updatedAt: '2022-04-01T09:14:15.674Z',
          updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/hippocampus-hub/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fsubjects%2Fddc23e1c-b83a-42ac-a44c-fca5710492fa',
        },
        _type: '_doc',
      },
      {
        _id:
          'https://bbp.epfl.ch/neurosciencegraph/data/subjects/5a3ae6c6-22bd-4125-a28c-61597f3920d8',
        _index:
          'delta_search_27d56f04-82d5-4ae7-92d9-057e620deddc_960c5f7c-c5fa-4c3f-9a7a-1927b5250714_1',
        _score: 1.0,
        _source: {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/subjects/5a3ae6c6-22bd-4125-a28c-61597f3920d8',
          '@type': 'https://neuroshapes.org/Subject',
          createdAt: '2022-04-01T09:14:15.679Z',
          createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          deprecated: false,
          name: 'ID 00578803',
          project: {
            identifier:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/hippocampus-hub',
            label: 'copies/hippocampus-hub',
          },
          updatedAt: '2022-04-01T09:14:15.679Z',
          updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/hippocampus-hub/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fsubjects%2F5a3ae6c6-22bd-4125-a28c-61597f3920d8',
        },
        _type: '_doc',
      },
      {
        _id:
          'https://bbp.epfl.ch/neurosciencegraph/data/subjects/53f3c75b-f003-4332-8c8b-b95303ac687f',
        _index:
          'delta_search_27d56f04-82d5-4ae7-92d9-057e620deddc_960c5f7c-c5fa-4c3f-9a7a-1927b5250714_1',
        _score: 1.0,
        _source: {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/subjects/53f3c75b-f003-4332-8c8b-b95303ac687f',
          '@type': 'https://neuroshapes.org/Subject',
          createdAt: '2022-04-01T09:14:15.683Z',
          createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          deprecated: false,
          name: 'oh140521',
          project: {
            identifier:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/hippocampus-hub',
            label: 'copies/hippocampus-hub',
          },
          updatedAt: '2022-04-01T09:14:15.683Z',
          updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/hippocampus-hub/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fsubjects%2F53f3c75b-f003-4332-8c8b-b95303ac687f',
        },
        _type: '_doc',
      },
      {
        _id:
          'https://bbp.epfl.ch/neurosciencegraph/data/subjects/09e1028a-550a-48dc-8af1-9e023db4d55a',
        _index:
          'delta_search_27d56f04-82d5-4ae7-92d9-057e620deddc_960c5f7c-c5fa-4c3f-9a7a-1927b5250714_1',
        _score: 1.0,
        _source: {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/subjects/09e1028a-550a-48dc-8af1-9e023db4d55a',
          '@type': 'https://neuroshapes.org/Subject',
          createdAt: '2022-04-01T09:14:15.820Z',
          createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          deprecated: false,
          name: 'ID 00575815',
          project: {
            identifier:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/hippocampus-hub',
            label: 'copies/hippocampus-hub',
          },
          updatedAt: '2022-04-01T09:14:15.820Z',
          updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/hippocampus-hub/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fsubjects%2F09e1028a-550a-48dc-8af1-9e023db4d55a',
        },
        _type: '_doc',
      },
      {
        _id:
          'https://bbp.epfl.ch/neurosciencegraph/data/subjects/68bb7b63-2d45-47e8-b21a-94b2f44f1326',
        _index:
          'delta_search_27d56f04-82d5-4ae7-92d9-057e620deddc_960c5f7c-c5fa-4c3f-9a7a-1927b5250714_1',
        _score: 1.0,
        _source: {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/subjects/68bb7b63-2d45-47e8-b21a-94b2f44f1326',
          '@type': 'https://neuroshapes.org/Subject',
          createdAt: '2022-04-01T09:14:15.820Z',
          createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          deprecated: false,
          name: 'mpg141017',
          project: {
            identifier:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/hippocampus-hub',
            label: 'copies/hippocampus-hub',
          },
          updatedAt: '2022-04-01T09:14:15.820Z',
          updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/hippocampus-hub/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fsubjects%2F68bb7b63-2d45-47e8-b21a-94b2f44f1326',
        },
        _type: '_doc',
      },
      {
        _id:
          'https://bbp.epfl.ch/neurosciencegraph/data/subjects/c855a4dd-2341-4659-92db-be5ff8e4121b',
        _index:
          'delta_search_27d56f04-82d5-4ae7-92d9-057e620deddc_960c5f7c-c5fa-4c3f-9a7a-1927b5250714_1',
        _score: 1.0,
        _source: {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/subjects/c855a4dd-2341-4659-92db-be5ff8e4121b',
          '@type': 'https://neuroshapes.org/Subject',
          createdAt: '2022-04-01T09:14:15.820Z',
          createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          deprecated: false,
          name: 'ID 00578795',
          project: {
            identifier:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/hippocampus-hub',
            label: 'copies/hippocampus-hub',
          },
          updatedAt: '2022-04-01T09:14:15.820Z',
          updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/hippocampus-hub/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fsubjects%2Fc855a4dd-2341-4659-92db-be5ff8e4121b',
        },
        _type: '_doc',
      },
      {
        _id:
          'https://bbp.epfl.ch/neurosciencegraph/data/subjects/98094743-71e3-4012-9d04-0c099de3cdfd',
        _index:
          'delta_search_27d56f04-82d5-4ae7-92d9-057e620deddc_960c5f7c-c5fa-4c3f-9a7a-1927b5250714_1',
        _score: 1.0,
        _source: {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/subjects/98094743-71e3-4012-9d04-0c099de3cdfd',
          '@type': 'https://neuroshapes.org/Subject',
          createdAt: '2022-04-01T09:14:15.823Z',
          createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          deprecated: false,
          name: 'ID 00578799',
          project: {
            identifier:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/hippocampus-hub',
            label: 'copies/hippocampus-hub',
          },
          updatedAt: '2022-04-01T09:14:15.823Z',
          updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/hippocampus-hub/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fsubjects%2F98094743-71e3-4012-9d04-0c099de3cdfd',
        },
        _type: '_doc',
      },
      {
        _id:
          'https://bbp.epfl.ch/neurosciencegraph/data/subjects/455f6845-48da-48a2-b91f-af5751f1d1b2',
        _index:
          'delta_search_27d56f04-82d5-4ae7-92d9-057e620deddc_960c5f7c-c5fa-4c3f-9a7a-1927b5250714_1',
        _score: 1.0,
        _source: {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/subjects/455f6845-48da-48a2-b91f-af5751f1d1b2',
          '@type': 'https://neuroshapes.org/Subject',
          createdAt: '2022-04-01T09:14:15.825Z',
          createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          deprecated: false,
          name: 'ID 00607359,',
          project: {
            identifier:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/hippocampus-hub',
            label: 'copies/hippocampus-hub',
          },
          updatedAt: '2022-04-01T09:14:15.825Z',
          updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/hippocampus-hub/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fsubjects%2F455f6845-48da-48a2-b91f-af5751f1d1b2',
        },
        _type: '_doc',
      },
      {
        _id:
          'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/bedd69e7-fb24-412a-bd1b-f0ae26b6bc56',
        _index:
          'delta_search_27d56f04-82d5-4ae7-92d9-057e620deddc_960c5f7c-c5fa-4c3f-9a7a-1927b5250714_1',
        _score: 1.0,
        _source: {
          '@id':
            'https://bbp.epfl.ch/neurosciencegraph/data/neuronmorphologies/bedd69e7-fb24-412a-bd1b-f0ae26b6bc56',
          '@type': [
            'https://neuroshapes.org/NeuronMorphology',
            'https://neuroshapes.org/ReconstructedCell',
          ],
          brainRegion: {
            identifier: 'http://purl.obolibrary.org/obo/UBERON_0014548',
            label: 'CA1_SP',
          },
          contributors: [
            {
              identifier:
                'https://bbp.epfl.ch/neurosciencegraph/data/persons/fc505f15-6144-4225-89f8-7bfffebf3828',
              label: 'Maurizio Pezzoli Gonzales',
            },
          ],
          createdAt: '2022-04-01T09:13:57.179Z',
          createdBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          deprecated: false,
          distribution: {
            contentSize: [655025, 794501],
            encodingFormat: ['application/asc', 'application/swc'],
            label: ['mpg141209_A_idA.ASC', 'mpg141209_A_idA.swc'],
          },
          license: {
            identifier: 'https://creativecommons.org/licenses/by/4.0/',
          },
          mType: {
            identifier:
              'http://bbp.epfl.ch/neurosciencegraph/ontologies/mtypes/UWn6SVr6TMKkvqSTtMPzrA',
            label: 'SP_PC',
          },
          name: 'mpg141209_A_idA',
          organizations: [
            {
              identifier: 'https://www.grid.ac/institutes/grid.5333.6',
              label: 'École Polytechnique Fédérale de Lausanne',
            },
          ],
          project: {
            identifier:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/hippocampus-hub',
            label: 'copies/hippocampus-hub',
          },
          subjectAge: {
            label: '15 days Post-natal',
            period: 'Post-natal',
            unit: 'days',
            value: 15,
          },
          subjectSpecies: {
            identifier: 'http://purl.obolibrary.org/obo/NCBITaxon_10116',
            label: 'Rattus norvegicus',
          },
          updatedAt: '2022-04-01T09:15:09.965Z',
          updatedBy:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
          _self:
            'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/hippocampus-hub/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2Fneuronmorphologies%2Fbedd69e7-fb24-412a-bd1b-f0ae26b6bc56',
        },
        _type: '_doc',
      },
    ],
    max_score: 1.0,
    total: { relation: 'eq', value: 13501 },
  },
  timed_out: false,
  took: 16,
  _shards: { failed: 0, skipped: 0, successful: 12, total: 12 },
};

describe('Filter Options Container', () => {
  // establish API mocking before all tests
  beforeAll(() => server.listen());
  // reset any request handlers that are declared as a part of our tests
  // (i.e. for testing one-time error scenarios)
  afterEach(() => server.resetHandlers());
  // clean up once the tests are done
  afterAll(() => server.close());

  const nexus = createNexusClient({
    fetch,
    uri: 'https://localhost:3000',
  });

  it('displays a filter for each aggregation as well as a missing option', async () => {
    const onFinish = vi.fn();
    const filter: ConfigField = {
      name: '',
      label: '',
      array: false,
      optional: false,
      fields: [{ name: '', format: '' }],
      filterable: false,
      sortable: false,
    };

    server.use(
      rest.post('https://localhost:3000/search/query*', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockFiltersResponse));
      })
    );

    await act(() => {
      render(
        <NexusProvider nexusClient={nexus}>
          <FilterOptions
            nexusClient={nexus}
            field={filter}
            onFinish={onFinish}
            filter={[]}
            query=""
          />
        </NexusProvider>
      );
    });

    expect(screen.getByRole('form')).toBeInTheDocument();

    // Test that each of the aggregations is in the list of filters
    const aggregations = mockFiltersResponse.aggregations.suggestions.buckets;
    console.log('@@aggregations', aggregations);
    aggregations.forEach(async b => {
      const element = await screen.findByText(b.key);
      expect(element).toBeInTheDocument();
    });

    const list = await screen.findByRole('list');

    // test that missing option is there
    const missingCheckbox = await within(list).findByRole('checkbox', {
      name: '(Missing)',
    });
    expect(missingCheckbox).toBeInTheDocument();

    // Length of list should be one more than number of aggregations
    expect((await screen.findAllByRole('listitem')).length).toBe(
      aggregations.length + 1
    );
  });

  it('filter is checked when in list of applied filters', async () => {
    const onFinish = vi.fn();
    const filter: ConfigField = {
      name: 'project',
      label: 'Project',
      array: false,
      optional: false,
      fields: [
        { name: 'identifier', format: 'uri' },
        { name: 'label', format: 'keyword' },
      ],
      filterable: true,
      sortable: true,
    };

    server.use(
      rest.post('https://localhost:3000/search/query*', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockFiltersResponse));
      })
    );

    await act(() => {
      render(
        <NexusProvider nexusClient={nexus}>
          <FilterOptions
            nexusClient={nexus}
            field={filter}
            onFinish={onFinish}
            filter={[
              {
                filters: ['copies/sscx'],
                filterTerm: 'project.label.keyword',
                filterType: 'anyof',
              },
            ]}
            query=""
          />
        </NexusProvider>
      );
    });

    const list = await screen.findByRole('list');
    const sscxCheckbox = await within(list).findByRole('checkbox', {
      name: 'copies/sscx',
    });

    expect(sscxCheckbox).toBeChecked();
  });

  it('checking a filter option causes the onFinish callback to be fired with applied filter options', async () => {
    const onFinish = vi.fn();
    const filter: ConfigField = {
      name: '',
      label: '',
      array: false,
      optional: false,
      fields: [{ name: '', format: '' }],
      filterable: false,
      sortable: false,
    };

    server.use(
      rest.post('https://localhost:3000/search/query*', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(mockFiltersResponse));
      })
    );

    await act(() => {
      render(
        <NexusProvider nexusClient={nexus}>
          <FilterOptions
            nexusClient={nexus}
            field={filter}
            onFinish={onFinish}
            filter={[]}
            query=""
          />
        </NexusProvider>
      );
    });

    const list = await screen.findByRole('list');
    const sscxOption = await screen.findByText('copies/sscx');
    fireEvent.click(sscxOption);
    const sscxCheckbox = await within(list).findByRole('checkbox', {
      name: 'copies/sscx',
    });

    expect(sscxCheckbox).toBeChecked();
    expect(onFinish).toHaveBeenCalledWith({
      filterType: 'anyof',
      filters: ['copies/sscx'],
      filterTerm: '.label.keyword',
    });
  });
});
