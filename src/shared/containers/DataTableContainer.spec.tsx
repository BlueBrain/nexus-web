import { createNexusClient } from '@bbp/nexus-sdk';
import { NexusProvider } from '@bbp/react-nexus';
import '@testing-library/jest-dom';
import { createMemoryHistory } from 'history';
import { Simulate } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import { RenderResult, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import {
  MOCK_VAR,
  ORIGINAL_1_SORTED_2,
  ORIGINAL_2_SORTED_1,
  ORIGINAL_3_SORTED_3,
  ORIGINAL_4_SORTED_4,
  ORIGINAL_5_SORTED_6,
  ORIGINAL_6_SORTED_5,
  dashboardResource,
  dashboardVocabulary,
  sparqlViewSingleResult,
} from '__mocks__/handlers/DataTableContainer/handlers';
import { deltaPath } from '__mocks__/handlers/handlers';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from 'react-query';
import configureStore from '../../shared/store';
import { cleanup, render, screen, waitFor } from '../../utils/testUtil';
import DataTableContainer from './DataTableContainer';

describe('DataTableContainer.spec.tsx', () => {
  const queryClient = new QueryClient();
  let dataTableContainer: JSX.Element;
  let container: HTMLElement;
  let rerender: (ui: React.ReactElement) => void;
  let user: UserEvent;
  let server: ReturnType<typeof setupServer>;
  let component: RenderResult;

  beforeAll(() => {
    server = setupServer(
      dashboardResource,
      dashboardVocabulary,
      sparqlViewSingleResult
    );

    server.listen();
  });

  beforeEach(async () => {
    const history = createMemoryHistory({});

    const nexus = createNexusClient({
      fetch,
      uri: deltaPath(),
    });
    const store = configureStore(history, { nexus }, {});
    dataTableContainer = (
      <Provider store={store}>
        <Router history={history}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <DataTableContainer
                orgLabel="bbp"
                projectLabel="agents"
                tableResourceId="https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp/agents/_/8478b9ae-c50e-4178-8aae-16221f2c6937"
                options={{
                  disableAddFromCart: true,
                  disableDelete: true,
                  disableEdit: true,
                }}
              />
            </NexusProvider>
          </QueryClientProvider>
        </Router>
      </Provider>
    );

    component = render(dataTableContainer);

    container = component.container;
    rerender = component.rerender;
    user = userEvent.setup();

    await waitForTableRows(6);
  });

  // reset any request handlers that are declared as a part of our tests
  // (i.e. for testing one-time error scenarios)
  afterEach(() => {
    cleanup();
    queryClient.clear();
  });

  afterAll(() => {
    server.resetHandlers();
    server.close();
  });

  const visibleTableRows = () => {
    return container.querySelectorAll('table tbody tr.data-table-row');
  };

  const columns = (name: string) => {
    return container.querySelectorAll(`td.testid-${name}`);
  };

  const waitForTableRows = async (expectedRowsCount: number) => {
    return await waitFor(() => {
      const rows = visibleTableRows();
      expect(rows.length).toEqual(expectedRowsCount);
      return rows;
    });
  };

  const getSortableHeader = async () => {
    return await waitFor(() => {
      const sortableHeader = screen.getByText(MOCK_VAR).closest('th');
      expect(sortableHeader).toBeDefined();
      return sortableHeader!;
    });
  };

  const assertDataOrderInColumn = (colName: string, expectedData: string[]) => {
    const actualDataInCol = columns(colName);
    expect(actualDataInCol.length).toEqual(expectedData.length);

    expectedData.forEach((expectedText, index) => {
      expect(actualDataInCol[index].textContent).toEqual(expectedText);
    });
  };

  const filterButtonForColumn = async (columnTitle: string) => {
    const titleRegExp = new RegExp(columnTitle, 'i');
    const columnHeader = await screen.getByRole('columnheader', {
      name: titleRegExp,
    });

    return within(columnHeader).queryByTestId('filter-icon');
  };

  it('displays unsorted data (i.e. in same order as received in server response) in table originally', async () => {
    await waitFor(() => {
      assertDataOrderInColumn('givenName', [
        ORIGINAL_1_SORTED_2,
        ORIGINAL_2_SORTED_1,
        ORIGINAL_3_SORTED_3,
        ORIGINAL_4_SORTED_4,
        ORIGINAL_5_SORTED_6,
        ORIGINAL_6_SORTED_5,
      ]);
    });
  });

  it('sorts rows in ascending order when header column clicked once', async () => {
    const sortableHeader = await getSortableHeader();

    // Click on sort button once to sort in ascending order
    await user.click(sortableHeader!);

    await waitForTableRows(6);

    assertDataOrderInColumn('givenName', [
      ORIGINAL_2_SORTED_1,
      ORIGINAL_1_SORTED_2,
      ORIGINAL_3_SORTED_3,
      ORIGINAL_4_SORTED_4,
      ORIGINAL_6_SORTED_5,
      ORIGINAL_5_SORTED_6,
    ]);
  });

  it('sorts rows in descending order when header column clicked twice', async () => {
    const sortableHeader = await getSortableHeader();

    // Click on sort button once to sort in ascending order
    await user.click(sortableHeader!);
    await user.click(sortableHeader!);

    await waitForTableRows(6);

    assertDataOrderInColumn('givenName', [
      ORIGINAL_5_SORTED_6,
      ORIGINAL_4_SORTED_4,
      ORIGINAL_6_SORTED_5,
      ORIGINAL_3_SORTED_3,
      ORIGINAL_1_SORTED_2,
      ORIGINAL_2_SORTED_1,
    ]);
  });

  it('shows filter option for columns that have filter enabled', async () => {
    const givenNameFilter = await filterButtonForColumn('Given Name');
    expect(givenNameFilter).toBeInTheDocument();
  });

  it('does not show filter option for columns that do not have filter enabled', async () => {
    const familyNameFilter = await filterButtonForColumn('Family Name');
    expect(familyNameFilter).not.toBeInTheDocument();
  });

  it('filters rows based on user input, ignoring case', async () => {
    const givenNameFilter = await filterButtonForColumn('Given Name');
    await user.click(givenNameFilter!);

    const filterMenuOption = await waitFor(() => {
      return within(screen.getByRole('menu')).getByText('sterling');
    });
    // NOTE: unfortunately using `userEvent.click(filterMenuOption` does not work because antd dropdown does not have the right css rules to allow pointer events.
    Simulate.click(filterMenuOption);

    const submitFilter = screen.getByRole('button', { name: 'OK' });
    Simulate.click(submitFilter);

    assertDataOrderInColumn('givenName', [
      ORIGINAL_4_SORTED_4,
      ORIGINAL_6_SORTED_5,
    ]);
  });

  it('shows error when dashboard fails to load', async () => {
    server.use(dashboardErrorHandler);

    // Rerender the component, this time using a handler that sends an error.
    component.unmount();
    rerender(dataTableContainer);

    await waitForTableRows(0);

    const errorMsg = await screen.findByText(/Table failed to fetch/);
    expect(errorMsg).toBeInTheDocument();

    const expandIcon = screen.getByRole('img', { name: 'right' });
    expandIcon.click();

    const errorDetails = screen.getByText(dashboardErrorResponse['@type']);
    expect(errorDetails).toBeInTheDocument();
    server.resetHandlers();
  });

  it('shows table as well as error when sparql query is invalid', async () => {
    server.use(invalidSparqlHandler);
    // Rerender the component, this time using a handler that sends a sparql error.
    component.unmount();
    rerender(dataTableContainer);

    // The table should is still be visible.
    await waitForTableRows(6);

    const errorMsg = await screen.findByText(invalidSparqlQueryResponse.reason);
    expect(errorMsg).toBeInTheDocument();

    server.resetHandlers();
  });
});

const dashboardErrorResponse = {
  '@context': 'https://bluebrain.github.io/nexus/contexts/error.json',
  '@type': 'ResourceNotFound',
  rejections: [
    {
      '@type': 'ResourceNotFound',
      reason:
        "File 'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/test/GithubRealmDinika/_/5e9dd7cd-f88d-4197-85e6-255bd5dfe3547' not found in project 'test/GithubRealmLocal'.",
      status: 404,
    },
  ],
};

const dashboardErrorHandler = rest.get(
  deltaPath(
    `resources/bbp/agents/_/${encodeURIComponent(
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp/agents/_/8478b9ae-c50e-4178-8aae-16221f2c6937'
    )}`
  ),
  (req, res, ctx) => {
    return res(ctx.status(404), ctx.json(dashboardErrorResponse));
  }
);

const invalidSparqlQueryResponse = {
  '@context': 'https://bluebrain.github.io/nexus/contexts/error.json',
  '@type': 'SparqlClientError',
  reason:
    "an HTTP response to endpoint 'http://blazegraph.bbp-ou-nise-dev.svc/blazegraph/namespace/nexus_709e9644-a4c7-46fc-b683-be2d2ae963f1_1/sparql' with method 'HttpMethod(POST)' that should have been successful, returned the HTTP status code '400 Bad Request'",
  details: 'Tsch. Tsch. You added a bad bad query.',
};

export const invalidSparqlHandler = rest.post(
  deltaPath('/views/bbp/agents/graph/sparql'),
  (req, res, ctx) => {
    return res(ctx.status(400), ctx.json(invalidSparqlQueryResponse));
  }
);
