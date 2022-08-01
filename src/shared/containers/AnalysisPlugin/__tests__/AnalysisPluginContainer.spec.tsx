import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import fetch from 'node-fetch';
import { QueryClient, QueryClientProvider } from 'react-query';
import AnalysisPluginContainer from '../AnalysisPluginContainer';
import { deltaPath } from '__mocks__/handlers/handlers';
import {
  render,
  server,
  fireEvent,
  waitFor,
  screen,
} from '../../../../utils/testUtil';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import {
  sparqlAnalysisReportNoResultsHandler,
  resourcesAnalysisReportType,
  sparqlAnalysisReportSingleResult,
} from '__mocks__/handlers/AnalysisPlugin/handlers';

describe('Analysis Plugin', () => {
  const mockState = {
    config: {
      apiEndpoint: deltaPath(),
      analysisPluginSparqlDataQuery: 'detailedCircuit',
    },
  };
  const queryClient = new QueryClient();
  const mockStore = configureStore();
  jest.mock('react-redux', () => {
    const ActualReactRedux = jest.requireActual('react-redux');
    return {
      ...ActualReactRedux,
      useSelector: jest.fn().mockImplementation(() => {
        return mockState;
      }),
    };
  });

  // establish API mocking before all tests
  beforeAll(() => server.listen());
  // reset any request handlers that are declared as a part of our tests
  // (i.e. for testing one-time error scenarios)
  afterEach(() => {
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
    await act(async () => {
      await render(
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
    });

    await waitFor(() => {
      const addButton = screen.getByRole('button', {
        name: 'Add Analysis Report',
      });
      expect(addButton).toBeInTheDocument();
    });
  });

  it('clicking add New Analysis Report button results in screen displaying all required options to create new Analysis Report', async () => {
    server.use(sparqlAnalysisReportNoResultsHandler);

    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    });

    await waitFor(() => {
      screen.getByRole('button', {
        name: 'Add Analysis Report',
      });
    });

    await act(async () => {
      const addButton = await screen.findByRole('button', {
        name: 'Add Analysis Report',
      });
      fireEvent.click(addButton);
    });

    expect(
      await waitFor(() => screen.getByRole('button', { name: 'Save' }))
    ).toBeInTheDocument();

    expect(
      await waitFor(() => screen.getByRole('button', { name: 'Cancel' }))
    ).toBeInTheDocument();

    expect(
      await waitFor(() =>
        screen.getByRole('textbox', { name: 'Analysis Name' })
      )
    ).toBeInTheDocument();

    expect(
      await waitFor(() =>
        screen.getByRole('textbox', { name: 'Analysis Description' })
      )
    ).toBeInTheDocument();

    expect(
      await waitFor(() =>
        screen.getByRole('button', { name: 'Add Files to Analysis' })
      )
    ).toBeInTheDocument();
  });

  it('On Create New Analysis screen, clicking cancel will return to the view mode', async () => {
    server.use(sparqlAnalysisReportNoResultsHandler);

    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    });

    await waitFor(() => {
      screen.getByRole('button', {
        name: 'Add Analysis Report',
      });
    });

    await act(async () => {
      const addButton = await screen.findByRole('button', {
        name: 'Add Analysis Report',
      });
      fireEvent.click(addButton);
    });

    await act(async () => {
      const cancelBtn = await waitFor(() =>
        screen.getByRole('button', { name: 'Cancel' })
      );
      fireEvent.click(cancelBtn);
    });

    await waitFor(() => {
      screen.getByRole('button', {
        name: 'Add Analysis Report',
      });
    });
  });

  it('On Create New Analysis screen, clicking save will trigger analysis report to be saved', async () => {
    server.use(
      sparqlAnalysisReportNoResultsHandler,
      resourcesAnalysisReportType
    );

    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    });

    await waitFor(() => {
      screen.getByRole('button', {
        name: 'Add Analysis Report',
      });
    });

    await act(async () => {
      const addButton = await screen.findByRole('button', {
        name: 'Add Analysis Report',
      });
      fireEvent.click(addButton);
    });

    const analysisNameTextBox = await waitFor(() =>
      screen.getByRole('textbox', { name: 'Analysis Name' })
    );
    await fireEvent.change(analysisNameTextBox, {
      target: { value: 'New analysis name' },
    });

    const analysisDescriptionTextBox = await waitFor(() =>
      screen.getByRole('textbox', { name: 'Analysis Description' })
    );
    await fireEvent.change(analysisDescriptionTextBox, {
      target: { value: 'New analysis description' },
    });

    await act(async () => {
      const saveBtn = await waitFor(() =>
        screen.getByRole('button', { name: 'Save' })
      );
      fireEvent.click(saveBtn);
    });
  });

  it('On Create New Analysis screen, clicking cancel will return to the view mode', async () => {
    server.use(sparqlAnalysisReportNoResultsHandler);

    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    });

    await waitFor(() => {
      screen.getByRole('button', {
        name: 'Add Analysis Report',
      });
    });

    await act(async () => {
      const addButton = await screen.findByRole('button', {
        name: 'Add Analysis Report',
      });
      fireEvent.click(addButton);
    });

    await act(async () => {
      const cancelBtn = await waitFor(() =>
        screen.getByRole('button', { name: 'Cancel' })
      );
      fireEvent.click(cancelBtn);
    });

    await waitFor(() => {
      screen.getByRole('button', {
        name: 'Add Analysis Report',
      });
    });
  });

  it('On an individual analysis report, the option to navigate to the parent container resource is presented', async () => {
    server.use(sparqlAnalysisReportSingleResult);
    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    });

    await waitFor(() => {
      screen.getByRole('button', {
        name: 'Go to parent resource',
      });
    });
  });

  it('On a container analysis resource, each individual analysis has an options menu with the option to navigate to the resource', async () => {
    server.use(sparqlAnalysisReportSingleResult);
    const history = createMemoryHistory({});

    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    });

    await act(async () => {
      const optionsButton = await screen.findByRole('button', {
        name: 'Options',
      });
      fireEvent.mouseEnter(optionsButton);
    });

    expect(
      await waitFor(() =>
        screen.getByRole('menuitem', { name: 'Go to resource' })
      )
    ).toBeInTheDocument();
  });

  it('on initial load the first analysis report is visible', async () => {
    server.use(sparqlAnalysisReportSingleResult);

    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    });

    expect(
      await waitFor(
        () =>
          screen.getByRole('heading', { name: 'Analysis Name' }).textContent,
        { timeout: 10000 }
      )
    ).toBe('Our Very First Analysis Report!');
  });

  it('when at least one of the selected analysis reports has an asset then the zoom options are visible', async () => {
    server.use(sparqlAnalysisReportSingleResult);

    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    });

    expect(
      await waitFor(() => screen.getByLabelText(/Increase\/Decrease/))
    ).toBeInTheDocument();
  });

  it('when no analysis report selected, zoom options are hidden', async () => {
    server.use(sparqlAnalysisReportNoResultsHandler);

    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    });

    expect(
      screen.queryByLabelText(/Increase\/Decrease/)
    ).not.toBeInTheDocument();
  });

  it('analysis report assets show image name (or filename if not present) along with last updated details', async () => {
    server.use(sparqlAnalysisReportSingleResult);

    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    });
    // expect asset name to be present
    expect(
      await waitFor(() => screen.getByText('insta_logo_large.png'))
    ).toBeVisible();
  });

  it('clicking analysis report asset opens preview of asset', async () => {
    server.use(sparqlAnalysisReportSingleResult);

    const history = createMemoryHistory({});
    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    });
    // expect asset name to be present
    await act(async () => {
      const asset = await waitFor(() =>
        screen.getByLabelText('Analysis Asset')
      );
      fireEvent.click(asset);
      expect(
        await waitFor(() => screen.getByText('insta_logo_large.png'))
      ).toBeInTheDocument();
    });
  });

  it('On edit mode image delete button is visible', async () => {
    server.use(sparqlAnalysisReportSingleResult);
    const history = createMemoryHistory({});

    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    });

    await act(async () => {
      const optionsButton = await screen.findByRole('button', {
        name: 'Options',
      });
      fireEvent.mouseEnter(optionsButton);
      await waitFor(() => {
        const edit = screen.getByRole('menuitem', { name: 'Edit' });
        fireEvent.click(edit);
      });
    });
    expect(
      await waitFor(() => screen.getByLabelText('Analysis Asset'))
    ).toBeInTheDocument();
  });
});
