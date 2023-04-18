import { createNexusClient } from '@bbp/nexus-sdk';
import { NexusProvider } from '@bbp/react-nexus';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import {
    Mock_Var,
    Original_Order_1_Sorted_2,
    Original_Order_2_Sorted_1,
    Original_Order_3_Sorted_3,
    Original_Order_4_Sorted_4,
    Original_Order_5_Sorted_6,
    Original_Order_6_Sorted_5,
    dashboardResource,
    dashboardVocabulary,
    sparqlViewSingleResult,
} from '__mocks__/handlers/DataTableContainer/handlers';
import { deltaPath } from '__mocks__/handlers/handlers';
import { createMemoryHistory } from 'history';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Router } from 'react-router-dom';
import { cleanup, render, screen, server, waitFor } from '../../utils/testUtil';
import DataTableContainer from './DataTableContainer';

describe('DataTableContainer.spec.tsx', () => {
  const queryClient = new QueryClient();
  let container: HTMLElement;
  let user: UserEvent;

  beforeAll(() => {
    server.listen();
    server.use(dashboardResource, dashboardVocabulary, sparqlViewSingleResult);
  });

  beforeEach(() => {
    const history = createMemoryHistory({});
    const nexus = createNexusClient({
      fetch,
      uri: deltaPath(),
    });

    const component = render(
      <Router history={history}>
        <QueryClientProvider client={queryClient}>
          <NexusProvider nexusClient={nexus}>
            <DataTableContainer
              orgLabel="copies"
              projectLabel="sscx"
              tableResourceId="https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/8478b9ae-c50e-4178-8aae-16221f2c6937"
              options={{
                disableAddFromCart: true,
                disableDelete: true,
                disableEdit: true,
              }}
            />
          </NexusProvider>
        </QueryClientProvider>
      </Router>
    );

    container = component.container;
    user = userEvent.setup();
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

  const getSortableHeader = async () => {
    return await waitFor(() => {
      visibleTableRows();
      const sortableHeader = screen.getByText(Mock_Var).closest('th');
      expect(sortableHeader).toBeDefined();
      return sortableHeader!;
    });
  };

  it('displays unsorted data (i.e. in same order as received in server response) in table originally', async () => {
    await waitFor(() => {
      const rows = visibleTableRows();

      expect(rows.length).toEqual(5);
      expect(rows[0].textContent).toEqual(Original_Order_1_Sorted_2);
      expect(rows[1].textContent).toEqual(Original_Order_2_Sorted_1);
      expect(rows[2].textContent).toEqual(Original_Order_3_Sorted_3);
      expect(rows[3].textContent).toEqual(Original_Order_4_Sorted_4);
      expect(rows[4].textContent).toEqual(Original_Order_5_Sorted_6);
    });
  });

  it('sorts rows in ascending order when header column clicked once', async () => {
    const sortableHeader = await getSortableHeader();

    // Click on sort button once to sort in ascending order
    await user.click(sortableHeader!);

    await waitFor(() => {
      const sortedRows = visibleTableRows();
      expect(sortedRows.length).toEqual(5);

      expect(sortedRows[0].textContent).toEqual(Original_Order_2_Sorted_1);
      expect(sortedRows[1].textContent).toEqual(Original_Order_1_Sorted_2);
      expect(sortedRows[2].textContent).toEqual(Original_Order_3_Sorted_3);
      expect(sortedRows[3].textContent).toEqual(Original_Order_4_Sorted_4);
      expect(sortedRows[4].textContent).toEqual(Original_Order_6_Sorted_5);
    });
  });

  it('sorts rows in descending order when header column clicked twice', async () => {
    const sortableHeader = await getSortableHeader();

    // Click on sort button once to sort in ascending order
    await user.click(sortableHeader!);
    await user.click(sortableHeader!);

    await waitFor(() => {
      const sortedRows = visibleTableRows();
      expect(sortedRows.length).toEqual(5);

      expect(sortedRows[0].textContent).toEqual(Original_Order_5_Sorted_6);
      expect(sortedRows[1].textContent).toEqual(Original_Order_4_Sorted_4);
      expect(sortedRows[2].textContent).toEqual(Original_Order_6_Sorted_5);
      expect(sortedRows[3].textContent).toEqual(Original_Order_3_Sorted_3);
      expect(sortedRows[4].textContent).toEqual(Original_Order_1_Sorted_2);
    });
  });
});
