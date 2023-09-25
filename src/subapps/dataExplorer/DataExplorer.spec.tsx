import { Resource, createNexusClient } from '@bbp/nexus-sdk';
import { NexusProvider } from '@bbp/react-nexus';
import '@testing-library/jest-dom';
import { RenderResult, act, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import {
  dataExplorerPageHandler,
  filterByProjectHandler,
  getCompleteResources,
  getMockResource,
  graphAnalyticsTypeHandler,
  sourceResourceHandler,
} from '__mocks__/handlers/DataExplorer/handlers';
import { deltaPath } from '__mocks__/handlers/handlers';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from 'react-query';
import { render, screen, waitFor } from '../../utils/testUtil';
import DataExplorer from './DataExplorer';
import { AllProjects } from './ProjectSelector';
import { getColumnTitle } from './DataExplorerTable';
import {
  CONTAINS,
  DOES_NOT_CONTAIN,
  DOES_NOT_EXIST,
  EXISTS,
  getAllPaths,
} from './PredicateSelector';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from '../../shared/store';
import { ALWAYS_DISPLAYED_COLUMNS, isNexusMetadata } from './DataExplorerUtils';

window.scrollTo = jest.fn();

describe('DataExplorer', () => {
  const defaultTotalResults = 500_123;
  const ALWAYS_PRESENT_RESOURCE_PROPERTY = 'propertyAlwaysThere';
  const mockResourcesOnPage1: Resource[] = getCompleteResources();
  const mockResourcesForPage2: Resource[] = [
    getMockResource('self1', { author: 'piggy', edition: 1 }, 'unhcr', 'file'),
    getMockResource('self2', { author: ['iggy', 'twinky'] }, 'unhcr', 'file'),
    getMockResource('self3', { year: 2013 }, 'unhcr', 'file'),
  ];

  const server = setupServer(
    dataExplorerPageHandler(undefined, defaultTotalResults),
    sourceResourceHandler(),
    filterByProjectHandler(),
    graphAnalyticsTypeHandler()
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
    await expectRowCountToBe(mockResourcesOnPage1.length);
  });

  afterEach(async () => {
    server.resetHandlers();
    await userEvent.click(container); // Close any open dropdowns
    sessionStorage.clear(); // Clear the selected columns and filters in session storage.
  });

  afterAll(() => {
    server.resetHandlers();
    server.close();
  });

  const DropdownSelector = '.ant-select-dropdown';
  const DropdownOptionSelector = 'div.ant-select-item-option-content';
  const CustomOptionSelector = 'div.ant-select-item-option-content > span';
  const TypeOptionSelector = 'div.select-row .ant-col > span';

  const PathMenuLabel = 'path-selector';
  const PredicateMenuLabel = 'predicate-selector';
  const ProjectMenuLabel = 'project-filter';
  const TypeMenuLabel = 'type-filter';

  const expectRowCountToBe = async (expectedRowsCount: number) => {
    return await waitFor(() => {
      const rows = visibleTableRows();
      rows.forEach(row => {
        // console.log('MY ROW', row.innerHTML)
      });
      expect(rows.length).toEqual(expectedRowsCount);
      return rows;
    });
  };

  const waitForHeaderToBeHidden = async () => {
    return await waitFor(() => {
      const dataExplorerHeader = document.querySelector(
        '.data-explorer-header'
      ) as HTMLDivElement;
      expect(dataExplorerHeader).not.toBeVisible();
    });
  };

  const waitForHeaderToBeVisible = async () => {
    return await waitFor(() => {
      const dataExplorerHeader = document.querySelector(
        '.data-explorer-header'
      ) as HTMLDivElement;
      expect(dataExplorerHeader).toBeVisible();
    });
  };

  const expectColumHeaderToExist = async (name: string) => {
    const nameReg = new RegExp(getColumnTitle(name), 'i');
    const header = await screen.getByText(nameReg, {
      selector: 'th .ant-table-column-title',
      exact: false,
    });
    expect(header).toBeInTheDocument();
    return header;
  };

  const getColumnSorter = async (colName: string) => {
    const column = await expectColumHeaderToExist(colName);
    return column.closest('.ant-table-column-sorters');
  };

  const getTotalColumns = () => {
    return Array.from(container.querySelectorAll('th'));
  };

  const expectColumHeaderToNotExist = async (name: string) => {
    expect(expectColumHeaderToExist(name)).rejects.toThrow();
  };

  const getTextForColumn = async (resource: Resource, colName: string) => {
    const row = await screen.getByTestId(resource._self);

    const allCellsForRow = Array.from(row.childNodes);
    const colIndex = Array.from(
      container.querySelectorAll('th')
    ).findIndex(header =>
      header.innerHTML.match(new RegExp(getColumnTitle(colName), 'i'))
    );
    return allCellsForRow[colIndex].textContent;
  };

  const getRowForResource = async (resource: Resource) => {
    const row = await screen.getByTestId(resource._self);
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
    const projectColumn = row.querySelector('td.data-explorer-column-_project');
    return projectColumn?.textContent;
  };

  const typeFromRow = (row: Element) => {
    const typeColumn = row.querySelector('td.data-explorer-column-\\@type');
    return typeColumn?.textContent;
  };

  const columnTextFromRow = (row: Element, colName: string) => {
    const column = row.querySelector(`td.data-explorer-column-${colName}`);
    return column?.textContent;
  };

  const visibleTableRows = () => {
    return container.querySelectorAll('table tbody tr.data-explorer-row');
  };

  const getProjectAutocomplete = async () => {
    return await screen.getByLabelText('project-filter', {
      selector: 'input',
    });
  };

  const getDropdownOption = async (
    optionLabel: string,
    selector: string = DropdownOptionSelector
  ) =>
    await screen.getByText(new RegExp(`${optionLabel}$`, 'i'), {
      selector,
    });

  const getRowsForNextPage = async (
    resources: Resource[],
    total: number = 300
  ) => {
    server.use(
      sourceResourceHandler(resources),
      dataExplorerPageHandler(resources, total)
    );

    const pageInput = await screen.getByRole('listitem', { name: '2' });
    expect(pageInput).toBeInTheDocument();

    await user.click(pageInput);

    await expectRowCountToBe(3);
  };

  const getInputForLabel = async (label: string) => {
    return (await screen.getByLabelText(label, {
      selector: 'input',
    })) as HTMLInputElement;
  };

  const getSelectedValueInMenu = async (menuLabel: string) => {
    const input = await getInputForLabel(menuLabel);
    return input
      .closest('.ant-select-selector')
      ?.querySelector('.ant-select-selection-item')?.innerHTML;
  };

  const openMenuFor = async (ariaLabel: string) => {
    const menuInput = await getInputForLabel(ariaLabel);
    await userEvent.click(menuInput, { pointerEventsCheck: 0 });
    await act(async () => {
      fireEvent.mouseDown(menuInput);
    });
    const menuDropdown = document.querySelector(DropdownSelector);
    expect(menuDropdown).toBeInTheDocument();
    return menuDropdown;
  };

  const selectPath = async (
    path: string,
    project: string = 'unhcr',
    type: string = 'file'
  ) => {
    // Select `project` project if it is not already selected
    const projectInput = await getInputForLabel(ProjectMenuLabel);
    if (!projectInput.value.match(new RegExp(project, 'i'))) {
      await selectOptionFromMenu(ProjectMenuLabel, project);
    }

    // Select `type` type if it is not already selected
    const typeInput = await getSelectedValueInMenu(TypeMenuLabel);
    if (!typeInput?.match(new RegExp(type, 'i'))) {
      await selectOptionFromMenu(TypeMenuLabel, type, TypeOptionSelector);
    }

    await selectOptionFromMenu(PathMenuLabel, path, CustomOptionSelector);
  };

  const selectPredicate = async (predicate: string) => {
    await selectOptionFromMenu(PredicateMenuLabel, predicate);
  };

  const selectOptionFromMenu = async (
    menuAriaLabel: string,
    optionLabel: string,
    optionSelector?: string
  ) => {
    await openMenuFor(menuAriaLabel);
    const option = await getDropdownOption(optionLabel, optionSelector);
    await userEvent.click(option, { pointerEventsCheck: 0 });
  };

  /**
   * @returns All options visible in the currently open dropdown menu in the DOM.
   * NOTE: Since antd menus use virtual scroll, not all options inside the menu are visible.
   * This function only returns those options that are visible.
   */
  const getVisibleOptionsFromMenu = (
    selector: string = DropdownOptionSelector
  ) => {
    const menuDropdown = document.querySelector(DropdownSelector);
    return Array.from(menuDropdown?.querySelectorAll(selector) ?? []);
  };

  const getTotalSizeOfDataset = async (expectedCount: string) => {
    const totalFromBackend = await screen.getByText('Total:');
    const totalCount = within(totalFromBackend).getByText(
      new RegExp(`${expectedCount} dataset`, 'i')
    );
    return totalCount;
  };

  const getSizeOfCurrentlyLoadedData = async (expectedCount: number) => {
    const totalFromBackend = await screen.getByText(
      'Sample loaded for review:'
    );
    const totalCount = within(totalFromBackend).getByText(
      new RegExp(`${expectedCount}`, 'i')
    );
    return totalCount;
  };

  const getFilteredResultsCount = async (expectedCount: number = 0) => {
    const filteredCountLabel = screen.queryByText(/of which/i);
    if (!filteredCountLabel) {
      return filteredCountLabel;
    }
    const filteredCount = within(filteredCountLabel).getByText(
      new RegExp(`${expectedCount}`, 'i')
    );
    return filteredCount;
  };

  const updateResourcesShownInTable = async (
    resources: Resource[] = mockResourcesForPage2
  ) => {
    await expectRowCountToBe(10);
    await getRowsForNextPage(resources);
    await expectRowCountToBe(resources.length);
    server.use(filterByProjectHandler(mockResourcesForPage2));
  };

  const getResetProjectButton = async () => {
    return await screen.getByTestId('reset-project-button');
  };

  const showMetadataSwitch = async () =>
    await screen.getByLabelText('Show metadata');

  const showEmptyDataCellsSwitch = async () =>
    await screen.getByLabelText('Show empty data cells');

  const resetPredicate = async () => {
    const resetPredicateButton = await screen.getByRole('button', {
      name: /reset predicate/i,
    });
    await userEvent.click(resetPredicateButton);
  };

  const expectRowsInOrder = async (expectedOrder: Resource[]) => {
    for await (const [index, row] of visibleTableRows().entries()) {
      const text = await columnTextFromRow(row, 'author');
      if (expectedOrder[index].author) {
        expect(text).toMatch(JSON.stringify(expectedOrder[index].author));
      } else {
        expect(text).toMatch(/No data/i);
      }
    }
  };

  const expectDataExplorerHeaderToExist = async () => {
    const pro = await getProjectAutocomplete();
    expect(pro).toBeVisible();
    const type = await getInputForLabel(TypeMenuLabel);
    expect(type).toBeVisible();
    const totalResultsCount = await getTotalSizeOfDataset('500,123');
    expect(totalResultsCount).toBeVisible();
    const metadataSwitch = await showMetadataSwitch();
    expect(metadataSwitch).toBeVisible();
    const showEmptyCellsToggle = await showEmptyDataCellsSwitch();
    expect(showEmptyCellsToggle).toBeVisible();
  };

  const scrollWindow = async (yPosition: number) => {
    await fireEvent.scroll(window, { target: { scrollY: yPosition } });
  };

  const getButtonByLabel = async (label: string) => {
    const buttonElement = await screen.getByRole('button', {
      name: label,
    });
    return buttonElement;
  };

  const expandHeaderButton = async () =>
    await getButtonByLabel('expand-header');

  const collapseHeaderButton = async () =>
    await getButtonByLabel('collapse-header');

  const clickExpandHeaderButton = async () => {
    const expandHeaderButtonElement = await expandHeaderButton();

    await userEvent.click(expandHeaderButtonElement);
  };

  const clickCollapseHeaderButton = async () => {
    const collapseHeaderButtonElement = await collapseHeaderButton();
    await userEvent.click(collapseHeaderButtonElement);
  };

  it('shows columns for fields that are only in source data', async () => {
    await expectRowCountToBe(10);
    const column = await expectColumHeaderToExist('userProperty1');
    expect(column).toBeInTheDocument();
  });

  it('shows rows for all fetched resources', async () => {
    await expectRowCountToBe(10);
  });

  it('shows only user columns for each top level property by default', async () => {
    await expectRowCountToBe(10);
    const seenColumns = new Set();

    for (const mockResource of mockResourcesOnPage1) {
      for (const topLevelProperty of Object.keys(mockResource)) {
        if (!seenColumns.has(topLevelProperty)) {
          seenColumns.add(topLevelProperty);

          if (ALWAYS_DISPLAYED_COLUMNS.has(topLevelProperty)) {
            await expectColumHeaderToExist(getColumnTitle(topLevelProperty));
          } else if (isNexusMetadata(topLevelProperty)) {
            expect(
              expectColumHeaderToExist(getColumnTitle(topLevelProperty))
            ).rejects.toThrow();
          } else {
            await expectColumHeaderToExist(getColumnTitle(topLevelProperty));
          }
        }
      }
    }

    expect(seenColumns.size).toBeGreaterThan(1);
  });

  it('shows user columns for all top level properties when show user metadata clicked', async () => {
    await expectRowCountToBe(10);
    const showMetadataButton = await showMetadataSwitch();
    await userEvent.click(showMetadataButton);

    const seenColumns = new Set();

    for (const mockResource of mockResourcesOnPage1) {
      for (const topLevelProperty of Object.keys(mockResource)) {
        if (!seenColumns.has(topLevelProperty)) {
          seenColumns.add(topLevelProperty);
          await expectColumHeaderToExist(getColumnTitle(topLevelProperty));
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
    const resourceWithMissingProperty = mockResourcesOnPage1.find(
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
    const resourceWithUndefinedProperty = mockResourcesOnPage1.find(
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
    const resourceWithUndefinedProperty = mockResourcesOnPage1.find(
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
    const resourceWithEmptyString = mockResourcesOnPage1.find(
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
    const resourceWithEmptyArray = mockResourcesOnPage1.find(
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
    const resourceWithEmptyObject = mockResourcesOnPage1.find(
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
  });

  it('resets selected project when user clicks reset button', async () => {
    await selectOptionFromMenu(ProjectMenuLabel, 'unhcr');

    expect(visibleTableRows().length).toBeLessThan(10);

    const resetProjectButton = await getResetProjectButton();
    await userEvent.click(resetProjectButton);
    await expectRowCountToBe(10);
  });

  it('shows all projects when allProjects option is selected', async () => {
    await selectOptionFromMenu(ProjectMenuLabel, 'unhcr');

    expect(visibleTableRows().length).toBeLessThan(10);

    const resetProjectButton = await getResetProjectButton();
    await userEvent.click(resetProjectButton);
    await selectOptionFromMenu(ProjectMenuLabel, AllProjects);

    await expectRowCountToBe(10);
  });

  it('shows autocomplete options for project filter', async () => {
    await searchForProject('bbp');
    await expectProjectOptionsToMatch('bbp');

    await searchForProject('bbc');
    await expectProjectOptionsToMatch('bbc');
  });

  it('shows resources filtered by the selected type', async () => {
    await expectRowCountToBe(10);
    await selectOptionFromMenu(TypeMenuLabel, 'file', TypeOptionSelector);

    visibleTableRows().forEach(row =>
      expect(typeFromRow(row)).toMatch(/file/i)
    );
  });

  it('only shows types that exist in selected project in type autocomplete', async () => {
    await expectRowCountToBe(10);

    await openMenuFor(TypeMenuLabel);
    const optionBefore = await getDropdownOption('Dataset', TypeOptionSelector);
    expect(optionBefore).toBeInTheDocument();

    await selectOptionFromMenu(ProjectMenuLabel, 'unhcr');
    await expectRowCountToBe(2);

    await openMenuFor(TypeMenuLabel);
    expect(
      getDropdownOption('Dataset', TypeOptionSelector)
    ).rejects.toThrowError();
  });

  it('shows resources that have path missing', async () => {
    await updateResourcesShownInTable(mockResourcesForPage2);

    await selectPath('author');
    await selectOptionFromMenu(PredicateMenuLabel, DOES_NOT_EXIST);
    await expectRowCountToBe(1);

    await resetPredicate();

    await selectPath('edition');
    await selectOptionFromMenu(PredicateMenuLabel, DOES_NOT_EXIST);
    await expectRowCountToBe(2);
  });

  it('shows resources that contains value provided by user', async () => {
    await updateResourcesShownInTable([
      getMockResource('self1', { author: 'piggy', edition: 1 }),
      getMockResource('self2', { author: ['iggy', 'twinky'] }),
      getMockResource('self3', { year: 2013 }),
    ]);

    await selectPath('author');
    await userEvent.click(container);
    await selectOptionFromMenu(PredicateMenuLabel, CONTAINS);
    const valueInput = await screen.getByPlaceholderText('Search for...');
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

    await selectPath('author');
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

    await selectPath('author');
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

    await selectPath('author');
    await userEvent.click(container);
    await selectOptionFromMenu(PredicateMenuLabel, DOES_NOT_CONTAIN);
    const valueInput = await screen.getByPlaceholderText('Search for...');
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

    const firstDataRow = await getRowForResource(mockResourcesOnPage1[0]);
    await userEvent.click(firstDataRow);

    expect(history.location.pathname).toContain('self1');
  });

  it('shows total size of dataset', async () => {
    await expectRowCountToBe(10);
    const totalBackendCount = await getTotalSizeOfDataset('500,123');
    expect(totalBackendCount).toBeVisible();
  });

  it('shows results currently loaded in frontend', async () => {
    await expectRowCountToBe(10);
    const loadedDataCount = await getSizeOfCurrentlyLoadedData(10);
    expect(loadedDataCount).toBeVisible();
  });

  it('shows updated total from backend when user searches by project', async () => {
    await expectRowCountToBe(10);
    const totalBackendBefore = await getTotalSizeOfDataset('500,123');
    expect(totalBackendBefore).toBeVisible();

    await selectOptionFromMenu(ProjectMenuLabel, 'unhcr');
    await expectRowCountToBe(2);

    const totalBackendAfter = await getTotalSizeOfDataset('2');
    expect(totalBackendAfter).toBeVisible();
  });

  it('does not show filtered count if predicate is not selected', async () => {
    await expectRowCountToBe(10);
    const totalFromFrontend = await getFilteredResultsCount();
    expect(totalFromFrontend).toEqual(null);
  });

  it('shows total filtered count if predicate is selected', async () => {
    await expectRowCountToBe(10);
    await updateResourcesShownInTable(mockResourcesForPage2);

    await selectPath('author');
    await userEvent.click(container);
    await selectOptionFromMenu(PredicateMenuLabel, EXISTS);
    await expectRowCountToBe(2);
    const totalFromFrontendAfter = await getFilteredResultsCount(2);
    expect(totalFromFrontendAfter).toBeVisible();
  });

  it('shows column for metadata path even if toggle for show metadata is off', async () => {
    const metadataProperty = '_createdBy';
    await expectRowCountToBe(10);

    await expectColumHeaderToNotExist(metadataProperty);

    const originalColumns = getTotalColumns().length;

    await selectPath(metadataProperty);
    await selectOptionFromMenu(PredicateMenuLabel, EXISTS);

    await expectColumHeaderToExist(metadataProperty);
    expect(getTotalColumns().length).toEqual(originalColumns + 1);

    await resetPredicate();
    expect(getTotalColumns().length).toEqual(originalColumns);
  });

  it('resets predicate fields when reset predicate clicked', async () => {
    await updateResourcesShownInTable(mockResourcesForPage2);

    await selectPath('author');
    await selectPredicate(EXISTS);

    const selectedPathBefore = await getSelectedValueInMenu(PathMenuLabel);
    expect(selectedPathBefore).toMatch(/author/);
    await expectRowCountToBe(2);

    await resetPredicate();

    await expectRowCountToBe(3);

    const selectedPathAfter = await getSelectedValueInMenu(PathMenuLabel);
    expect(selectedPathAfter).toBeFalsy();
  });

  it('only shows predicate menu if path is selected', async () => {
    await expectRowCountToBe(10);

    expect(openMenuFor(PredicateMenuLabel)).rejects.toThrow();
    await selectPath(ALWAYS_PRESENT_RESOURCE_PROPERTY);
    expect(openMenuFor(PredicateMenuLabel)).resolves.not.toThrow();
  });

  it('sorts table columns', async () => {
    const dataSource = [
      getMockResource('self1', { author: 'tweaty', edition: 1 }),
      getMockResource('self2', { edition: 2001 }),
      getMockResource('self3', { year: 2013, author: 'piggy' }),
    ];
    await updateResourcesShownInTable(dataSource);

    await expectRowsInOrder(dataSource);

    const authorColumnSorter = await getColumnSorter('author');
    await userEvent.click(authorColumnSorter!);

    await expectRowsInOrder([dataSource[1], dataSource[2], dataSource[0]]);
  });

  it('does not show "No data" cell if "Show empty data cells" toggle is turned off', async () => {
    await expectRowCountToBe(10);
    const resourceWithMissingProperty = mockResourcesOnPage1.find(
      res => !('specialProperty' in res)
    )!;
    const textForSpecialProperty = await getTextForColumn(
      resourceWithMissingProperty,
      'specialProperty'
    );
    expect(textForSpecialProperty).toMatch(/No data/i);

    const button = await showEmptyDataCellsSwitch();
    await userEvent.click(button);

    const textForSpecialPropertyAfter = await getTextForColumn(
      resourceWithMissingProperty,
      'specialProperty'
    );
    expect(textForSpecialPropertyAfter).toMatch('');
  });

  it('show data explorer header by default', async () => {
    await expectDataExplorerHeaderToExist();
  });

  it('hides data explorer header when user scrolls past its height', async () => {
    await expectDataExplorerHeaderToExist();

    await scrollWindow(500);
    await waitForHeaderToBeHidden();

    expect(expectDataExplorerHeaderToExist()).rejects.toThrow();
  });

  it('shows expand header button when data explorer is not visible', async () => {
    await scrollWindow(500);
    await waitForHeaderToBeHidden();

    await clickExpandHeaderButton();

    await expectDataExplorerHeaderToExist();
  });

  it('collapses header again when collapse button is clicked', async () => {
    await scrollWindow(500);
    await waitForHeaderToBeHidden();

    await clickExpandHeaderButton();
    await expectDataExplorerHeaderToExist();

    await clickCollapseHeaderButton();
    expect(expectDataExplorerHeaderToExist()).rejects.toThrow();
  });

  it('hides expand header button when user scrolls up', async () => {
    await scrollWindow(500);
    await waitForHeaderToBeHidden();

    expect(await expandHeaderButton()).toBeVisible();

    await scrollWindow(0);
    await waitForHeaderToBeVisible();

    expect(expandHeaderButton()).rejects.toThrow();
  });

  it('hides collapse header button when user scrolls up', async () => {
    await scrollWindow(500);
    await waitForHeaderToBeHidden();

    await clickExpandHeaderButton();
    expect(await collapseHeaderButton()).toBeVisible();

    await scrollWindow(0);
    expect(collapseHeaderButton()).rejects.toThrow();
  });

  it('does not reset values in filters when header was hidden due to scroll', async () => {
    await selectPath(ALWAYS_PRESENT_RESOURCE_PROPERTY);

    await scrollWindow(500);
    await waitForHeaderToBeHidden();

    await scrollWindow(0);
    await waitForHeaderToBeVisible();

    const projectInput = await getInputForLabel(ProjectMenuLabel);
    expect(projectInput.value).toMatch(new RegExp('unhcr', 'i'));

    const typeInput = await getSelectedValueInMenu(TypeMenuLabel);
    expect(typeInput).toMatch(new RegExp('file', 'i'));

    const pathInput = await getSelectedValueInMenu(PathMenuLabel);
    expect(pathInput).toMatch(
      new RegExp(ALWAYS_PRESENT_RESOURCE_PROPERTY, 'i')
    );
  });

  it('resets predicate search term when different predicate verb is selected', async () => {
    await updateResourcesShownInTable(mockResourcesForPage2);

    await selectPath('author');

    await selectPredicate(CONTAINS);
    const valueInput = await screen.getByPlaceholderText('Search for...');
    await userEvent.type(valueInput, 'iggy');

    await selectPredicate(EXISTS);

    await selectPredicate(DOES_NOT_CONTAIN);

    const valueInputAfter = await screen.getByPlaceholderText('Search for...');
    expect((valueInputAfter as HTMLInputElement).value).not.toEqual('iggy');
  });

  it('does not show predicate selector if multiple types are selected', async () => {
    await selectOptionFromMenu(ProjectMenuLabel, 'unhcr');
    await selectOptionFromMenu(TypeMenuLabel, 'file', TypeOptionSelector);

    expect(await getInputForLabel(PathMenuLabel)).toBeVisible();

    await selectOptionFromMenu(
      TypeMenuLabel,
      'StudioDashboard',
      TypeOptionSelector
    );
    expect(getInputForLabel(PathMenuLabel)).rejects.toThrow();
  });
});
