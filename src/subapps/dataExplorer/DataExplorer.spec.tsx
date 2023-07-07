import { Resource, createNexusClient } from '@bbp/nexus-sdk';
import { NexusProvider } from '@bbp/react-nexus';
import '@testing-library/jest-dom';
import { RenderResult, act, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import {
  dataExplorerPageHandler,
  defaultMockResult,
  filterByProjectHandler,
  getMockResource,
  getProjectHandler,
} from '__mocks__/handlers/DataExplorer/handlers';
import { deltaPath } from '__mocks__/handlers/handlers';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, screen, waitFor } from '../../utils/testUtil';
import { DataExplorer } from './DataExplorer';
import { AllProjects } from './ProjectSelector';
import { getColumnTitle } from './DataExplorerTable';
import {
  CONTAINS,
  DEFAULT_OPTION,
  DOES_NOT_CONTAIN,
  DOES_NOT_EXIST,
  EXISTS,
  getAllPaths,
} from './PredicateSelector';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from '../../shared/store';

describe('DataExplorer', () => {
  const defaultTotalResults = 500;

  const server = setupServer(
    dataExplorerPageHandler(defaultMockResult, defaultTotalResults),
    filterByProjectHandler(defaultMockResult),
    getProjectHandler()
  );
  const history = createMemoryHistory({});

  let container: HTMLElement;
  let user: UserEvent;
  let component: RenderResult;
  let dataExplorerPage: JSX.Element;

  beforeEach(async () => {
    server.listen();
    const queryClient = new QueryClient();
    const nexus = createNexusClient({
      fetch,
      uri: deltaPath(),
    });
    const store = configureStore(history, { nexus }, {});

    dataExplorerPage = (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <Router history={history}>
            <NexusProvider nexusClient={nexus}>
              <DataExplorer />
            </NexusProvider>
          </Router>
        </QueryClientProvider>
      </Provider>
    );

    component = render(dataExplorerPage);

    container = component.container;
    user = userEvent.setup();
  });

  afterEach(async () => {
    server.resetHandlers();
    await userEvent.click(container); // Close any open dropdowns
  });

  afterAll(() => {
    server.resetHandlers();
    server.close();
  });

  const DropdownSelector = '.ant-select-dropdown';
  const DropdownOptionSelector = 'div.ant-select-item-option-content';
  const PathMenuLabel = 'path-selector';
  const PredicateMenuLabel = 'predicate-selector';
  const ProjectMenuLabel = 'project-filter';

  const expectRowCountToBe = async (expectedRowsCount: number) => {
    return await waitFor(() => {
      const rows = visibleTableRows();
      expect(rows.length).toEqual(expectedRowsCount);
      return rows;
    });
  };

  const expectColumHeaderToExist = async (name: string) => {
    const nameReg = new RegExp(getColumnTitle(name), 'i');
    const header = await screen.getByText(nameReg, {
      selector: 'th',
      exact: false,
    });
    expect(header).toBeInTheDocument();
    return header;
  };

  const getTextForColumn = async (resource: Resource, colName: string) => {
    const selfCell = await screen.getAllByText(
      new RegExp(resource._self, 'i'),
      {
        selector: 'td',
      }
    );

    const allCellsForRow = Array.from(selfCell[0].parentElement!.childNodes);
    const colIndex = Array.from(
      container.querySelectorAll('th')
    ).findIndex(header =>
      header.innerHTML.match(new RegExp(getColumnTitle(colName), 'i'))
    );
    return allCellsForRow[colIndex].textContent;
  };

  const getRowForResource = async (resource: Resource) => {
    const selfCell = await screen.getAllByText(
      new RegExp(resource._self, 'i'),
      {
        selector: 'td',
      }
    );
    const row = selfCell[0].parentElement;
    expect(row).toBeInTheDocument();
    return row!;
  };

  const openProjectAutocomplete = async () => {
    const projectAutocomplete = await getProjectAutocomplete();
    await userEvent.click(projectAutocomplete);
    return projectAutocomplete;
  };

  const searchForProject = async (searchTerm: string) => {
    const projectAutocomplete = await openProjectAutocomplete();
    await userEvent.clear(projectAutocomplete);
    await userEvent.type(projectAutocomplete, searchTerm);
    return projectAutocomplete;
  };

  const expectProjectOptionsToMatch = async (searchTerm: string) => {
    const projectOptions = await screen.getAllByRole('option');
    expect(projectOptions.length).toBeGreaterThan(0);
    projectOptions.forEach(option => {
      expect(option.innerHTML).toMatch(new RegExp(searchTerm, 'i'));
    });
  };

  const projectFromRow = (row: Element) => {
    const projectColumn = row.querySelector('td'); // first column is the project column
    return projectColumn?.textContent;
  };

  const visibleTableRows = () => {
    return container.querySelectorAll('table tbody tr.data-explorer-row');
  };

  const getProjectAutocomplete = async () => {
    return await screen.getByLabelText('project-filter', {
      selector: 'input',
    });
  };

  const getDropdownOption = async (optionLabel: string) =>
    await screen.getByText(new RegExp(`${optionLabel}$`), {
      selector: DropdownOptionSelector,
    });

  const getRowsForNextPage = async (
    resources: Resource[],
    total: number = 300
  ) => {
    server.use(dataExplorerPageHandler(resources, total));

    const pageInput = await screen.getByRole('listitem', { name: '2' });
    expect(pageInput).toBeInTheDocument();

    await user.click(pageInput);

    await expectRowCountToBe(3);
  };

  const openMenuFor = async (ariaLabel: string) => {
    const menuInput = await screen.getByLabelText(ariaLabel, {
      selector: 'input',
    });
    await userEvent.click(menuInput, { pointerEventsCheck: 0 });
    await act(async () => {
      fireEvent.mouseDown(menuInput);
    });
    const menuDropdown = document.querySelector(DropdownSelector);
    expect(menuDropdown).toBeInTheDocument();
    return menuDropdown;
  };

  const selectOptionFromMenu = async (
    menuAriaLabel: string,
    optionLabel: string
  ) => {
    await openMenuFor(menuAriaLabel);
    const option = await getDropdownOption(optionLabel);
    await userEvent.click(option, { pointerEventsCheck: 0 });
  };

  /**
   * @returns All options visible in the currently open dropdown menu in the DOM.
   * NOTE: Since antd menus use virtual scroll, not all options inside the menu are visible.
   * This function only returns those options that are visible.
   */
  const getVisibleOptionsFromMenu = () => {
    const menuDropdown = document.querySelector(DropdownSelector);
    return Array.from(
      menuDropdown?.querySelectorAll(DropdownOptionSelector) ?? []
    );
  };

  const getTotalCountFromBackend = async (
    expectedCount = defaultTotalResults
  ) => {
    const totalFromBackend = await screen.getByText('Total from backend:');
    const totalCount = within(totalFromBackend).getByText(
      new RegExp(`${expectedCount} dataset`, 'i')
    );
    return totalCount;
  };

  const getTotalFromFrontend = async (expectedCount: number = 0) => {
    const totalFromFrontend = await screen.queryByText('Total from frontend:');
    if (!totalFromFrontend) {
      return totalFromFrontend;
    }
    const totalCount = within(totalFromFrontend).getByText(
      new RegExp(`${expectedCount} dataset`, 'i')
    );
    return totalCount;
  };

  const updateResourcesShownInTable = async (resources: Resource[]) => {
    await expectRowCountToBe(10);
    await getRowsForNextPage(resources);
    await expectRowCountToBe(resources.length);
  };

  it('shows rows for all fetched resources', async () => {
    await expectRowCountToBe(10);
  });

  it('shows columns for each top level property in resources', async () => {
    await expectRowCountToBe(10);
    const seenColumns = new Set();

    for (const mockResource of defaultMockResult) {
      for (const topLevelProperty of Object.keys(mockResource)) {
        if (!seenColumns.has(topLevelProperty)) {
          seenColumns.add(topLevelProperty);
          const header = getColumnTitle(topLevelProperty);
          await expectColumHeaderToExist(header);
        }
      }
    }

    expect(seenColumns.size).toBeGreaterThan(1);
  });

  it('shows project as the first column', async () => {
    await expectRowCountToBe(10);
    const firstColumn = container.querySelector('th.data-explorer-column');
    expect(firstColumn?.textContent).toMatch(/project/i);
  });

  it('shows type as the second column', async () => {
    await expectRowCountToBe(10);
    const secondColumn = container.querySelectorAll(
      'th.data-explorer-column'
    )[1];
    expect(secondColumn?.textContent).toMatch(/type/i);
  });

  it('updates columns when new page is selected', async () => {
    await updateResourcesShownInTable([
      getMockResource('self1', { author: 'piggy', edition: 1 }),
      getMockResource('self2', { author: ['iggy', 'twinky'] }),
      getMockResource('self3', { year: 2013 }),
    ]);

    await expectColumHeaderToExist('author');
    await expectColumHeaderToExist('edition');
    await expectColumHeaderToExist('year');
  });

  it('updates page size', async () => {
    await expectRowCountToBe(10);

    const mock100Resources: Resource[] = [];

    for (let i = 0; i < 100; i = i + 1) {
      mock100Resources.push(getMockResource(`self${i}`, {}));
    }

    server.use(dataExplorerPageHandler(mock100Resources));

    const pageSizeChanger = await screen.getByRole('combobox', {
      name: 'Page Size',
    });
    await userEvent.click(pageSizeChanger);
    const twentyRowsOption = await screen.getByTitle('20 / page');
    await userEvent.click(twentyRowsOption, { pointerEventsCheck: 0 });
    await expectRowCountToBe(20);
  });

  it('shows No data text when values are missing for a column', async () => {
    await expectRowCountToBe(10);
    const resourceWithMissingProperty = defaultMockResult.find(
      res => !('specialProperty' in res)
    )!;
    const textForSpecialProperty = await getTextForColumn(
      resourceWithMissingProperty,
      'specialProperty'
    );
    expect(textForSpecialProperty).toMatch(/No data/i);
  });

  it('shows No data text when values is undefined', async () => {
    await expectRowCountToBe(10);
    const resourceWithUndefinedProperty = defaultMockResult.find(
      res => res.specialProperty === undefined
    )!;
    const textForSpecialProperty = await getTextForColumn(
      resourceWithUndefinedProperty,
      'specialProperty'
    );
    expect(textForSpecialProperty).toMatch(/No data/i);
  });

  it('does not show No data text when values is null', async () => {
    await expectRowCountToBe(10);
    const resourceWithUndefinedProperty = defaultMockResult.find(
      res => res.specialProperty === null
    )!;
    const textForSpecialProperty = await getTextForColumn(
      resourceWithUndefinedProperty,
      'specialProperty'
    );
    expect(textForSpecialProperty).not.toMatch(/No data/i);
    expect(textForSpecialProperty).toMatch(/null/);
  });

  it('does not show No data when value is empty string', async () => {
    await expectRowCountToBe(10);
    const resourceWithEmptyString = defaultMockResult.find(
      res => res.specialProperty === ''
    )!;

    const textForSpecialProperty = await getTextForColumn(
      resourceWithEmptyString,
      'specialProperty'
    );
    expect(textForSpecialProperty).not.toMatch(/No data/i);
    expect(textForSpecialProperty).toEqual('""');
  });

  it('does not show No data when value is empty array', async () => {
    await expectRowCountToBe(10);
    const resourceWithEmptyArray = defaultMockResult.find(
      res =>
        Array.isArray(res.specialProperty) && res.specialProperty.length === 0
    )!;

    const textForSpecialProperty = await getTextForColumn(
      resourceWithEmptyArray,
      'specialProperty'
    );
    expect(textForSpecialProperty).not.toMatch(/No data/i);
    expect(textForSpecialProperty).toEqual('[]');
  });

  it('does not show No data when value is empty object', async () => {
    await expectRowCountToBe(10);
    const resourceWithEmptyObject = defaultMockResult.find(
      res =>
        typeof res.specialProperty === 'object' &&
        res.specialProperty !== null &&
        !Array.isArray(res.specialProperty) &&
        Object.keys(res.specialProperty).length === 0
    )!;

    const textForSpecialProperty = await getTextForColumn(
      resourceWithEmptyObject,
      'specialProperty'
    );
    expect(textForSpecialProperty).not.toMatch(/No data/i);
    expect(textForSpecialProperty).toEqual('{}');
  });

  it('shows resources filtered by the selected project', async () => {
    await selectOptionFromMenu(ProjectMenuLabel, 'unhcr');

    visibleTableRows().forEach(row =>
      expect(projectFromRow(row)).toMatch(/unhcr/i)
    );

    await selectOptionFromMenu(ProjectMenuLabel, AllProjects);
    await expectRowCountToBe(10);
  });

  it('shows autocomplete options for project filter', async () => {
    await searchForProject('bbp');
    await expectProjectOptionsToMatch('bbp');

    await searchForProject('bbc');
    await expectProjectOptionsToMatch('bbc');
  });

  it('shows paths as options in a select menu of path selector', async () => {
    await openMenuFor('path-selector');

    const pathOptions = getVisibleOptionsFromMenu();

    const expectedPaths = getAllPaths(defaultMockResult);
    expect(expectedPaths.length).toBeGreaterThanOrEqual(
      Object.keys(defaultMockResult[0]).length
    );
    expect(pathOptions[0].innerHTML).toMatch(DEFAULT_OPTION);

    pathOptions.slice(1).forEach((path, index) => {
      expect(path.innerHTML).toMatch(
        new RegExp(`${expectedPaths[index]}$`, 'i')
      );
    });

    expect(pathOptions.length).toBeGreaterThanOrEqual(3); // Since antd options in a select menu are displayed in a virtual list (by default), not all expected options are in the DOM.
  });

  it('shows resources that have path missing', async () => {
    await updateResourcesShownInTable([
      getMockResource('self1', { author: 'piggy', edition: 1 }),
      getMockResource('self2', { author: ['iggy', 'twinky'] }),
      getMockResource('self3', { year: 2013 }),
    ]);

    await selectOptionFromMenu(PathMenuLabel, 'author');
    await selectOptionFromMenu(PredicateMenuLabel, DOES_NOT_EXIST);
    await expectRowCountToBe(1);

    await selectOptionFromMenu(PathMenuLabel, 'edition');
    await selectOptionFromMenu(PredicateMenuLabel, DOES_NOT_EXIST);
    await expectRowCountToBe(2);
  });

  it('shows resources that contains value provided by user', async () => {
    await updateResourcesShownInTable([
      getMockResource('self1', { author: 'piggy', edition: 1 }),
      getMockResource('self2', { author: ['iggy', 'twinky'] }),
      getMockResource('self3', { year: 2013 }),
    ]);

    await selectOptionFromMenu(PathMenuLabel, 'author');
    await userEvent.click(container);
    await selectOptionFromMenu(PredicateMenuLabel, CONTAINS);
    const valueInput = await screen.getByPlaceholderText('type the value...');
    await userEvent.type(valueInput, 'iggy');
    await expectRowCountToBe(2);

    await userEvent.clear(valueInput);

    await userEvent.type(valueInput, 'goldilocks');
    await expectRowCountToBe(0);
  });

  it('shows all resources when the user has not typed anything in the value filter', async () => {
    await updateResourcesShownInTable([
      getMockResource('self1', { author: 'piggy', edition: 1 }),
      getMockResource('self2', { author: ['iggy', 'twinky'] }),
      getMockResource('self3', { year: 2013 }),
    ]);

    await selectOptionFromMenu(PathMenuLabel, 'author');
    await userEvent.click(container);
    await selectOptionFromMenu(PredicateMenuLabel, CONTAINS);
    await expectRowCountToBe(3);
  });

  it('shows resources that have a path when user selects exists predicate', async () => {
    await updateResourcesShownInTable([
      getMockResource('self1', { author: 'piggy', edition: 1 }),
      getMockResource('self2', { author: ['iggy', 'twinky'] }),
      getMockResource('self3', { year: 2013 }),
    ]);

    await selectOptionFromMenu(PathMenuLabel, 'author');
    await userEvent.click(container);
    await selectOptionFromMenu(PredicateMenuLabel, EXISTS);
    await expectRowCountToBe(2);
  });

  it('filters by resources that do not contain value provided by user', async () => {
    await updateResourcesShownInTable([
      getMockResource('self1', { author: 'piggy', edition: 1 }),
      getMockResource('self2', { author: ['iggy', 'twinky'] }),
      getMockResource('self3', { year: 2013 }),
    ]);

    await selectOptionFromMenu(PathMenuLabel, 'author');
    await userEvent.click(container);
    await selectOptionFromMenu(PredicateMenuLabel, DOES_NOT_CONTAIN);
    const valueInput = await screen.getByPlaceholderText('type the value...');
    await userEvent.type(valueInput, 'iggy');
    await expectRowCountToBe(2);

    await userEvent.clear(valueInput);
    await userEvent.type(valueInput, 'goldilocks');
    await expectRowCountToBe(3);

    await userEvent.clear(valueInput);
    await userEvent.type(valueInput, 'piggy');
    await expectRowCountToBe(2);

    await userEvent.clear(valueInput);
    await userEvent.type(valueInput, 'arch');
    await expectRowCountToBe(3);
  });

  it('navigates to resource view when user clicks on row', async () => {
    await expectRowCountToBe(10);

    expect(history.location.pathname).not.toContain('self1');

    const firstDataRow = await getRowForResource(defaultMockResult[0]);
    await userEvent.click(firstDataRow);

    expect(history.location.pathname).toContain('self1');
  });

  it('shows total results received from backend', async () => {
    await expectRowCountToBe(10);
    const totalBackendCount = await getTotalCountFromBackend(
      defaultTotalResults
    );
    expect(totalBackendCount).toBeVisible();
  });

  it('shows updated total from backend when user searches by project', async () => {
    await expectRowCountToBe(10);
    const totalBackendBefore = await getTotalCountFromBackend(
      defaultTotalResults
    );
    expect(totalBackendBefore).toBeVisible();

    await selectOptionFromMenu(ProjectMenuLabel, 'unhcr');
    await expectRowCountToBe(2);

    const totalBackendAfter = await getTotalCountFromBackend(2);
    expect(totalBackendAfter).toBeVisible();
  });

  it('does not show total frontend count if predicate is not selected', async () => {
    await expectRowCountToBe(10);
    const totalFromFrontend = await getTotalFromFrontend();
    expect(totalFromFrontend).toEqual(null);
  });

  it('does shows total frontend count if predicate is selected', async () => {
    await expectRowCountToBe(10);
    const totalFromFrontendBefore = await getTotalFromFrontend();
    expect(totalFromFrontendBefore).toEqual(null);

    await updateResourcesShownInTable([
      getMockResource('self1', { author: 'piggy', edition: 1 }),
      getMockResource('self2', { author: ['iggy', 'twinky'] }),
      getMockResource('self3', { year: 2013 }),
    ]);

    await selectOptionFromMenu(PathMenuLabel, 'author');
    await userEvent.click(container);
    await selectOptionFromMenu(PredicateMenuLabel, EXISTS);
    await expectRowCountToBe(2);

    const totalFromFrontendAfter = await getTotalFromFrontend(2);
    expect(totalFromFrontendAfter).toBeVisible();
  });
});