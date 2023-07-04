import { Resource, createNexusClient } from '@bbp/nexus-sdk';
import { NexusProvider } from '@bbp/react-nexus';
import '@testing-library/jest-dom';
import { RenderResult } from '@testing-library/react';
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

describe('DataExplorer', () => {
  const server = setupServer(
    dataExplorerPageHandler(defaultMockResult),
    filterByProjectHandler(defaultMockResult),
    getProjectHandler()
  );

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

    dataExplorerPage = (
      <QueryClientProvider client={queryClient}>
        <NexusProvider nexusClient={nexus}>
          <DataExplorer />
        </NexusProvider>
      </QueryClientProvider>
    );

    component = render(dataExplorerPage);

    container = component.container;
    user = userEvent.setup();
  });

  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => {
    server.resetHandlers();
    server.close();
  });

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

  const expectedHeader = (propName: string) => {
    switch (propName) {
      case '_project':
        return 'PROJECT';
      case '@type':
        return 'TYPE';
      default:
        return propName;
    }
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

  const openProjectAutocomplete = async () => {
    const projectAutocomplete = await getProjectAutocomplete();
    await userEvent.click(projectAutocomplete);
    return projectAutocomplete;
  };

  const selectProject = async (projectName: string) => {
    await openProjectAutocomplete();
    const unhcrProject = await getProjectOption(projectName);
    await userEvent.click(unhcrProject, { pointerEventsCheck: 0 });
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
          const header = expectedHeader(topLevelProperty);
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
    await expectRowCountToBe(10);

    server.use(
      dataExplorerPageHandler([
        getMockResource('self1', { author: 'piggy', edition: 1 }),
        getMockResource('self2', { author: ['iggy', 'twinky'] }),
        getMockResource('self3', { year: 2013 }),
      ])
    );

    const pageInput = await screen.getByRole('listitem', { name: '2' });
    expect(pageInput).toBeInTheDocument();

    await user.click(pageInput);

    await expectRowCountToBe(3);

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

  it('shows No data text when values is null', async () => {
    await expectRowCountToBe(10);
    const resourceWithUndefinedProperty = defaultMockResult.find(
      res => res.specialProperty === null
    )!;
    const textForSpecialProperty = await getTextForColumn(
      resourceWithUndefinedProperty,
      'specialProperty'
    );
    expect(textForSpecialProperty).toMatch(/No data/i);
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

  const getProjectOption = async (projectName: string) =>
    await screen.getByText(new RegExp(projectName, 'i'), {
      selector: 'div.ant-select-item-option-content',
    });

  it('shows resources filtered by the selected project', async () => {
    await selectProject('unhcr');

    visibleTableRows().forEach(row =>
      expect(projectFromRow(row)).toMatch(/unhcr/i)
    );

    await selectProject(AllProjects);
    await expectRowCountToBe(10);
  });

  it('shows autocomplete options for project filter', async () => {
    await searchForProject('bbp');
    await expectProjectOptionsToMatch('bbp');

    await searchForProject('bbc');
    await expectProjectOptionsToMatch('bbc');
  });
});
