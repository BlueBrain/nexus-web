import { deltaPath } from '__mocks__/handlers/handlers';
import {
  aclsHandler,
  identitiesHandler,
  viewErrorsHandler,
  viewsHandler,
  viewStatsHandler,
  viewWithIndexingErrors,
  viewWithNoIndexingErrors,
} from '__mocks__/handlers/Settings/ViewsSubViewHandlers';
import { createNexusClient } from '@bbp/nexus-sdk';
import { NexusProvider } from '@bbp/react-nexus';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { createMemoryHistory } from 'history';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router-dom';

import { configureStore } from '../../../../store';
import { render, screen, waitFor } from '../../../../utils/testUtil';
import ViewsSubView from './ViewsSubView';

describe('ViewsSubView', () => {
  const mockOrganisation = 'copies';
  const mockProject = 'hippocampus';

  const server = setupServer(
    identitiesHandler(),
    viewsHandler(mockOrganisation, mockProject),
    aclsHandler(mockOrganisation, mockProject),
    viewErrorsHandler(mockOrganisation, mockProject),
    viewStatsHandler(mockOrganisation, mockProject)
  );

  const history = createMemoryHistory({
    initialEntries: [`/orgs/${mockOrganisation}/${mockProject}/settings`],
  });

  let user: UserEvent;
  let container: HTMLElement;
  let viewsSubViewComponent: JSX.Element;

  beforeEach(async () => {
    server.listen();
    const queryClient = new QueryClient();
    const nexus = createNexusClient({
      fetch,
      uri: deltaPath(),
    });
    const store = configureStore(
      history,
      { nexus },
      { config: { apiEndpoint: 'https://localhost:3000' } }
    );

    viewsSubViewComponent = (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Router history={history}>
            <Route path="/orgs/:orgLabel/:projectLabel/settings">
              <NexusProvider nexusClient={nexus}>
                <ViewsSubView />
              </NexusProvider>
            </Route>
          </Router>
        </QueryClientProvider>
      </Provider>
    );

    const component = render(viewsSubViewComponent);

    container = component.container;
    user = userEvent.setup();
    await expectRowCountToBe(3);
  });

  it('shows a badge for views that have errors', async () => {
    expect(getErrorBadgeContent(viewWithIndexingErrors)).toEqual('2');
  });

  it('does not show error badge for views that dont have errors', async () => {
    expect(getErrorBadgeContent(viewWithNoIndexingErrors)).toBeUndefined();
  });

  it('shows indexing errors when view row is expanded', async () => {
    await expandRow(viewWithIndexingErrors);

    await screen.getByText(/2 Total errors/i, { selector: 'h3' });

    const indexingErrorRows = await getErrorRows();
    expect(indexingErrorRows.length).toEqual(2);

    const errorRow1 = await getErrorRow('Mock Error 1');
    expect(errorRow1).toBeTruthy();
    const errorRow2 = await getErrorRow('Mock Error 2');
    expect(errorRow2).toBeTruthy();
  });

  it('shows detailed error when error row is expanded', async () => {
    await expandRow(viewWithIndexingErrors);

    const errorRow1 = await getErrorRow('Mock Error 1');
    await user.click(errorRow1);

    const detailedErrorContainer = container.querySelector('.react-json-view');
    expect(detailedErrorContainer).toBeTruthy();
  });

  const getErrorRow = async (errorMessage: string) => {
    const row = await screen.getByText(new RegExp(errorMessage, 'i'), {
      selector: '.ant-collapse-header-text',
    });
    return row;
  };

  const getErrorRows = () => {
    const rowContainer = container.querySelector('div[data-testid="indexing-error-list"]')!;
    return Array.from(rowContainer.querySelector('ul')!.children);
  };

  const expandRow = async (rowId: string) => {
    const row = getViewRowById(rowId);
    const expandButton = row.querySelector('span[data-testid="Expand indexing errors"]')!;
    await user.click(expandButton);
  };

  const getViewRowById = (rowId: string) => {
    return container.querySelector(`tr[data-row-key="${rowId}"`)!;
  };

  const expectRowCountToBe = async (expectedRowsCount: number) => {
    return await waitFor(() => {
      const rows = visibleTableRows();
      expect(rows.length).toEqual(expectedRowsCount);
      return rows;
    });
  };

  const visibleTableRows = () => {
    return container.querySelectorAll('table tbody tr.view-item-row');
  };

  const getErrorBadgeContent = (rowId: string) => {
    const row = getViewRowById(rowId);
    return row.querySelector('sup')?.textContent;
  };
});
