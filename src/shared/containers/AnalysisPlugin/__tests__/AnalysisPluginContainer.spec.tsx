import { vi } from 'vitest';
import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk/es';
import * as React from 'react';
import fetch from 'node-fetch';
import { QueryClient, QueryClientProvider } from 'react-query';
import AnalysisPluginContainer from '../AnalysisPluginContainer';
import { deltaPath } from '__mocks__/handlers/handlers';
import {
  render,
  server,
  waitFor,
  screen,
  cleanup,
} from '../../../../utils/testUtil';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import userEvent from '@testing-library/user-event';
import {
  sparqlAnalysisReportNoResultsHandler,
  resourcesAnalysisReportType,
  sparqlAnalysisReportSingleResult,
  imageResourceFile,
  reportResource,
} from '__mocks__/handlers/AnalysisPlugin/handlers';
import {
  DEFAULT_REPORT_CATEGORIES,
  DEFAULT_REPORT_TYPES,
} from '../../../../constants';

describe('Analysis Plugin', () => {
  const mockState = {
    config: {
      apiEndpoint: deltaPath(),
      analysisPluginSparqlDataQuery: 'detailedCircuit',
      analysisPluginTypes: DEFAULT_REPORT_TYPES,
      analysisPluginCategories: DEFAULT_REPORT_CATEGORIES,
    },
    auth: {
      identities: [],
    },
  };
  const queryClient = new QueryClient();
  const mockStore = configureStore();
  jest.mock('react-redux', () => {
    const ActualReactRedux = jest.requireActual('react-redux');
    return {
      ...ActualReactRedux,
      useSelector: vi.fn().mockImplementation(() => {
        return mockState;
      }),
    };
  });

  // establish API mocking before all tests
  beforeAll(() => server.listen());
  // reset any request handlers that are declared as a part of our tests
  // (i.e. for testing one-time error scenarios)
  afterEach(() => {
    cleanup();
    server.resetHandlers();
    queryClient.clear();
  });
  // clean up once the tests are done
  afterAll(() => server.close());
  const nexus = createNexusClient({
    fetch,
    uri: deltaPath(),
  });

  it('add new Analysis Report button is present', async () => {
    server.use(sparqlAnalysisReportNoResultsHandler);

    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    render(
      <Router history={history}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel="projectLabel"
                orgLabel="orgLabel"
                resourceId="resourceId"
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      </Router>
    );

    await waitFor(() => {
      const addButton = screen.getByRole('button', {
        name: 'Add Report',
      });
      expect(addButton).toBeInTheDocument();
    });
  });

  it('clicking add New Analysis Report button results in screen displaying all required options to create new Analysis Report', async () => {
    server.use(sparqlAnalysisReportNoResultsHandler);
    const user = userEvent.setup();
    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    render(
      <Router history={history}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel="projectLabel"
                orgLabel="orgLabel"
                resourceId="resourceId"
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      </Router>
    );

    await waitFor(() => {
      screen.getByRole('button', {
        name: 'Add Report',
      });
    });

    const addButton = await screen.findByRole('button', {
      name: 'Add Report',
    });
    user.click(addButton);

    expect(
      await waitFor(() => screen.getByRole('button', { name: 'Save' }))
    ).toBeInTheDocument();

    expect(
      await waitFor(() => screen.getByRole('button', { name: 'Cancel' }))
    ).toBeInTheDocument();

    expect(
      await waitFor(() => screen.getByRole('textbox', { name: 'Report Name' }))
    ).toBeInTheDocument();

    expect(
      await waitFor(() =>
        screen.getByRole('textbox', { name: 'Report Description' })
      )
    ).toBeInTheDocument();

    expect(
      await waitFor(() => screen.getByText('3. Categories'))
    ).toBeInTheDocument();

    expect(
      await waitFor(() => screen.getByText('4. Types'))
    ).toBeInTheDocument();

    expect(
      await waitFor(() => screen.getByText('5. Add Assets'))
    ).toBeInTheDocument();

    expect(
      await waitFor(() => screen.getByText('6. Tools'))
    ).toBeInTheDocument();

    expect(
      await waitFor(() => screen.getByRole('button', { name: 'Add tool' }))
    ).toBeInTheDocument();
  });

  it('On Create New Analysis screen, clicking cancel will return to the view mode', async () => {
    server.use(sparqlAnalysisReportNoResultsHandler);
    const user = userEvent.setup();
    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    render(
      <Router history={history}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel="projectLabel"
                orgLabel="orgLabel"
                resourceId="resourceId"
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      </Router>
    );

    await waitFor(() => {
      screen.getByRole('button', {
        name: 'Add Report',
      });
    });

    const addButton = await screen.findByRole('button', {
      name: 'Add Report',
    });
    user.click(addButton);

    const cancelBtn = await waitFor(() =>
      screen.getByRole('button', { name: 'Cancel' })
    );
    user.click(cancelBtn);

    expect(
      await waitFor(() =>
        screen.getByRole('button', {
          name: 'Add Report',
        })
      )
    ).toBeInTheDocument();
  });

  it('On Create New Analysis screen, clicking save will trigger analysis report to be saved', async () => {
    server.use(
      sparqlAnalysisReportNoResultsHandler,
      resourcesAnalysisReportType
    );
    const user = userEvent.setup();
    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    render(
      <Router history={history}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel="projectLabel"
                orgLabel="orgLabel"
                resourceId="resourceId"
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      </Router>
    );

    await waitFor(() =>
      screen.getByRole('button', {
        name: 'Add Report',
      })
    );

    const addButton = await screen.findByRole('button', {
      name: 'Add Report',
    });
    user.click(addButton);

    const analysisNameTextBox = await waitFor(() =>
      screen.getByRole('textbox', { name: 'Report Name' })
    );

    user.type(analysisNameTextBox, 'New Report Name');

    const analysisDescriptionTextBox = await waitFor(() =>
      screen.getByRole('textbox', { name: 'Report Description' })
    );

    user.type(analysisDescriptionTextBox, 'New Report Description');

    const saveBtn = await waitFor(() =>
      screen.getByRole('button', { name: 'Save' })
    );

    user.click(saveBtn);
  });

  it('On Create New Analysis screen, clicking cancel will return to the view mode', async () => {
    server.use(sparqlAnalysisReportNoResultsHandler);
    const user = userEvent.setup();
    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    render(
      <Router history={history}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel="projectLabel"
                orgLabel="orgLabel"
                resourceId="resourceId"
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      </Router>
    );

    await waitFor(() => {
      screen.getByRole('button', {
        name: 'Add Report',
      });
    });

    const addButton = await screen.findByRole('button', {
      name: 'Add Report',
    });
    user.click(addButton);

    const cancelBtn = await waitFor(() =>
      screen.getByRole('button', { name: 'Cancel' })
    );
    user.click(cancelBtn);

    await waitFor(() => {
      screen.getByRole('button', {
        name: 'Add Report',
      });
    });
  });

  it('On an individual analysis report, the option to navigate to the parent container resource is presented', async () => {
    server.use(
      sparqlAnalysisReportSingleResult,
      reportResource,
      imageResourceFile
    );
    const user = userEvent.setup();
    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    render(
      <Router history={history}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel="projectLabel"
                orgLabel="orgLabel"
                resourceId="https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1"
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      </Router>
    );

    await waitFor(() => {
      const title = screen.getByText('Our Very First Analysis Report!');
      user.click(title);
    });
    await waitFor(() => {
      screen.getByRole('button', {
        name: 'Go to parent resource',
      });
    });
  });

  it('On a container analysis resource, each individual analysis has an option to navigate to the resource', async () => {
    server.use(sparqlAnalysisReportSingleResult, reportResource);
    const user = userEvent.setup();
    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    render(
      <Router history={history}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel="projectLabel"
                orgLabel="orgLabel"
                resourceId="https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysis1"
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      </Router>
    );

    await waitFor(() => {
      const title = screen.getByText('Our Very First Analysis Report!');
      user.click(title);
    });
    expect(
      await waitFor(() =>
        screen.getByRole('button', {
          name: /Open discussion on report resource/,
        })
      )
    ).toBeInTheDocument();
  });

  it('on initial load the first analysis report is visible', async () => {
    server.use(sparqlAnalysisReportSingleResult, reportResource);
    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    render(
      <Router history={history}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel="projectLabel"
                orgLabel="orgLabel"
                resourceId="resourceId"
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      </Router>
    );

    expect(
      await waitFor(() => screen.getByText('Our Very First Analysis Report!'))
    ).toBeInTheDocument();
  });

  it('when no analysis report selected, zoom options are hidden', async () => {
    server.use(sparqlAnalysisReportNoResultsHandler);
    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    render(
      <Router history={history}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel="projectLabel"
                orgLabel="orgLabel"
                resourceId="resourceId"
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      </Router>
    );

    expect(
      screen.queryByLabelText(/Increase\/Decrease/)
    ).not.toBeInTheDocument();
  });

  it('analysis report assets show image name (or filename if not present) along with last updated details', async () => {
    server.use(sparqlAnalysisReportSingleResult, reportResource);
    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    const user = userEvent.setup();
    render(
      <Router history={history}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel="projectLabel"
                orgLabel="orgLabel"
                resourceId="https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysis1"
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      </Router>
    );
    await waitFor(() => {
      const title = screen.getByText('Our Very First Analysis Report!');
      user.click(title);
    });
    // expect asset name to be present
    expect(
      await waitFor(() => screen.getByText('insta_logo_large.png'))
    ).toBeVisible();
  });

  it('clicking analysis report asset opens preview of asset', async () => {
    server.use(sparqlAnalysisReportSingleResult, reportResource);
    const user = userEvent.setup();
    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    render(
      <Router history={history}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel="projectLabel"
                orgLabel="orgLabel"
                resourceId="https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysis1"
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      </Router>
    );

    // expect asset name to be present
    await waitFor(() => {
      const title = screen.getByText('Our Very First Analysis Report!');
      user.click(title);
    });
    const asset = await waitFor(() =>
      screen.getByLabelText(/insta_logo_large/)
    );
    user.click(asset);
    expect(
      await waitFor(() => screen.getByText('insta_logo_large.png'))
    ).toBeInTheDocument();
  });
  it('In edit mode, image delete button is visible', async () => {
    server.use(sparqlAnalysisReportSingleResult, reportResource);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    render(
      <Router history={history}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel="projectLabel"
                orgLabel="orgLabel"
                resourceId="https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysis1"
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      </Router>
    );

    await waitFor(() => {
      const title = screen.getByText('Our Very First Analysis Report!');
      user.click(title);
    });

    await waitFor(() => {
      const edit = screen.getByRole('button', { name: 'Edit Report' });
      user.click(edit);
    });

    const analysisFile = await waitFor(
      () => screen.getAllByLabelText('Report File')[0]
    );
    user.click(analysisFile);

    expect(
      await waitFor(() => screen.getByRole('button', { name: 'Delete' }))
    ).toBeInTheDocument();
  });

  it('In edit mode, user can add a new tool to the report', async () => {
    server.use(sparqlAnalysisReportSingleResult, reportResource);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    render(
      <Router history={history}>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <NexusProvider nexusClient={nexus}>
              <AnalysisPluginContainer
                projectLabel="projectLabel"
                orgLabel="orgLabel"
                resourceId="https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysis1"
              ></AnalysisPluginContainer>
            </NexusProvider>
          </QueryClientProvider>
        </Provider>
      </Router>
    );

    await waitFor(() => {
      const title = screen.getByText('Our Very First Analysis Report!');
      user.click(title);
    });

    await waitFor(() => {
      const edit = screen.getByRole('button', { name: 'Edit Report' });
      user.click(edit);
    });

    await waitFor(() => {
      const addTool = screen.getByRole('button', { name: 'Add tool' });
      user.click(addTool);
    });

    expect(
      await waitFor(() => screen.getByText('Script Location'))
    ).toBeInTheDocument();
    expect(
      await waitFor(() => screen.getByText('How did you run the script?'))
    ).toBeInTheDocument();
  });
});
