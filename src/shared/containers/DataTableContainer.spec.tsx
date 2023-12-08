import '@testing-library/jest-dom';

import {
  dashboardResource,
  dashboardVocabulary,
  fetchResourceForDownload,
  getMockStudioResource,
  MOCK_VAR,
  ORIGINAL_1_SORTED_2,
  ORIGINAL_2_SORTED_1,
  ORIGINAL_3_SORTED_3,
  ORIGINAL_4_SORTED_4,
  ORIGINAL_5_SORTED_6,
  ORIGINAL_6_SORTED_5,
  sparqlViewResultHandler,
  sparqlViewSingleResult,
} from '__mocks__/handlers/DataTableContainer/handlers';
import { deltaPath } from '__mocks__/handlers/handlers';
import { createNexusClient } from '@bbp/nexus-sdk/es';
import { NexusProvider } from '@bbp/react-nexus';
import { act, RenderResult, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { createMemoryHistory } from 'history';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { describe, it } from 'vitest';

import { configureStore } from '../../store';
import { cleanup, render, screen, waitFor } from '../../utils/testUtil';
import DataTableContainer from './DataTableContainer';

describe(
  'DataTableContainer.spec.tsx',
  () => {
    const queryClient = new QueryClient();
    let dataTableContainer: JSX.Element;
    let container: HTMLElement;
    let user: UserEvent;
    let server: ReturnType<typeof setupServer>;
    let component: RenderResult;

    beforeAll(() => {
      server = setupServer(
        dashboardResource,
        dashboardVocabulary,
        sparqlViewSingleResult,
        fetchResourceForDownload
      );

      server.listen();

      const { getComputedStyle } = window;
      window.getComputedStyle = elt => getComputedStyle(elt);
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

      await act(async () => {
        await renderContainer(dataTableContainer);
      });

      await waitForTableRows(6);
    });

    const renderContainer = (containerToRender: JSX.Element) => {
      if (component) {
        component.unmount();
      }
      component = render(containerToRender);
      container = component.container;
      user = userEvent.setup();
    };

    // reset any request handlers that are declared as a part of our tests
    // (i.e. for testing one-time error scenarios)
    afterEach(() => {
      cleanup();
      queryClient.clear();
      localStorage.clear();
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

    const assertDataOrderInColumn = (
      colName: string,
      expectedData: string[]
    ) => {
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
      const expectedCellsInColumn = [
        ORIGINAL_1_SORTED_2,
        ORIGINAL_2_SORTED_1,
        ORIGINAL_3_SORTED_3,
        ORIGINAL_4_SORTED_4,
        ORIGINAL_5_SORTED_6,
        ORIGINAL_6_SORTED_5,
      ];

      await waitForTableRows(6);

      assertDataOrderInColumn('givenName', expectedCellsInColumn);
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
      await user.click(filterMenuOption);

      const submitFilter = screen.getByRole('button', { name: 'OK' });
      await user.click(submitFilter);

      assertDataOrderInColumn('givenName', [
        ORIGINAL_4_SORTED_4,
        ORIGINAL_6_SORTED_5,
      ]);
    });

    it('shows error when dashboard fails to load', async () => {
      server.use(dashboardErrorHandler);

      // Rerender the component, this time using a handler that sends an error.
      renderContainer(dataTableContainer);

      await waitForTableRows(0);

      const errorMsg = await screen.findByText(/Table failed to fetch/);
      expect(errorMsg).toBeInTheDocument();

      const expandIcon = screen.getByRole('img', { name: 'right' });
      await user.click(expandIcon);

      const errorDetails = screen.getByText(dashboardErrorResponse['@type']);
      expect(errorDetails).toBeInTheDocument();
      server.resetHandlers();
    });

    it('shows table as well as error when sparql query is invalid', async () => {
      server.use(invalidSparqlHandler);
      // Rerender the component, this time using a handler that sends a sparql error.

      renderContainer(dataTableContainer);

      // The table should still be visible.
      await waitForTableRows(6);

      const errorMsg = await screen.findByText(
        invalidSparqlQueryResponse.reason
      );
      expect(errorMsg).toBeInTheDocument();

      server.resetHandlers();
    });

    // I've noticed that when this spec runs after AnalysisPluginContainer.spec.tsx, this spec fails (https://github.com/BlueBrain/nexus-web/actions/runs/6432050230/job/17466531868?pr=1404).
    // While I investigate the issue, I'll add this to see if it brings any relief.
  },
  { retry: 3 }
);

describe(
  'DataTableContainer - Selection',
  () => {
    const queryClient = new QueryClient();
    let dataTableContainer: JSX.Element;
    let user: UserEvent;
    let server: ReturnType<typeof setupServer>;
    let component: RenderResult;
    const repeatedSelf =
      'https://localhost:3000/resources/bbp/agents/_/persons%2Fc3358e61-7650-4954-99b7-f7572cbf5d5g';

    const resourcesWithRepeatedSelf = [
      getMockStudioResource('Malory', repeatedSelf),
      getMockStudioResource('Lana', 'not-a-repeated-self'),
      getMockStudioResource('Malory', repeatedSelf),
      getMockStudioResource('Malory', repeatedSelf),
      getMockStudioResource('Malory', 'another-different-self'),
      getMockStudioResource('Malory', 'totally-different-self'),
    ];

    beforeAll(() => {
      server = setupServer(
        dashboardResource,
        dashboardVocabulary,
        fetchResourceForDownload,
        sparqlViewResultHandler(resourcesWithRepeatedSelf)
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

      renderContainer(dataTableContainer);
      localStorage.clear();
      await waitForTableRows(6);
    });

    const renderContainer = (containerToRender: JSX.Element) => {
      if (component) {
        component.unmount();
      }

      component = render(containerToRender);
      user = userEvent.setup();
    };

    // reset any request handlers that are declared as a part of our tests
    // (i.e. for testing one-time error scenarios)
    afterEach(() => {
      cleanup();
      queryClient.clear();
      localStorage.clear();
    });

    afterAll(() => {
      server.resetHandlers();
      server.close();
    });

    const visibleTableRows = () => {
      return screen.getAllByTestId('data-table-row');
    };

    const waitForTableRows = async (expectedRowsCount: number) => {
      return await waitFor(() => {
        const rows = visibleTableRows();
        expect(rows.length).toEqual(expectedRowsCount);
        return rows;
      });
    };

    const getSelectCheckboxForRow = async (index: number) => {
      return await waitFor(() => {
        const rows = visibleTableRows();
        const checkbox = rows[index].querySelector('input[type="checkbox"]');
        return checkbox;
      });
    };

    it('selects other rows with same self when user selects a row', async () => {
      const secondRowCheckbox = await getSelectCheckboxForRow(2);
      await user.click(secondRowCheckbox!);

      let checkedBoxesCount = 0;
      for await (const [
        index,
        studioRow,
      ] of resourcesWithRepeatedSelf.entries()) {
        const rowCheckbox = await getSelectCheckboxForRow(index);

        if (studioRow.self.value === repeatedSelf) {
          await waitFor(() =>
            expect(rowCheckbox as HTMLInputElement).toBeChecked()
          );
          checkedBoxesCount = checkedBoxesCount + 1;
        } else {
          expect(rowCheckbox as HTMLInputElement).not.toBeChecked();
        }
      }

      expect(checkedBoxesCount).toEqual(3);
    });

    it('shows info to user if selecting one row automatically selected other rows', async () => {
      const secondRowCheckbox = await getSelectCheckboxForRow(2);
      expect(secondRowCheckbox).toBeInTheDocument();

      await user.click(secondRowCheckbox!);

      await screen.findByText(
        '2 other resources with same metadata have also been automatically selected for download.'
      );
    });
  },

  // I've noticed that when this spec runs after AnalysisPluginContainer.spec.tsx, this spec fails (https://github.com/BlueBrain/nexus-web/actions/runs/6432050230/job/17466531868?pr=1404).
  // While I investigate the issue, I'll add this to see if it brings any relief.
  { retry: 3 }
);

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
  (_, res, ctx) => {
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
  deltaPath(
    `/views/bbp/agents/${encodeURIComponent(
      'https://bluebrain.github.io/nexus/vocabulary/defaultSparqlIndex'
    )}/sparql`
  ),
  (req, res, ctx) => {
    return res(ctx.status(400), ctx.json(invalidSparqlQueryResponse));
  }
);
