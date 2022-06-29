import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import * as React from 'react';
import fetch from 'node-fetch';
import { QueryClient, QueryClientProvider } from 'react-query';
import AnalysisPluginContainer from '../AnalysisPluginContainer';
import { rest } from 'msw';
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

describe('Analysis Plugin', () => {
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
  const mockState = {
    config: {
      apiEndpoint: 'https://localhost:3000',
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

  it('renders without data', async () => {
    server.use(
      rest.post(
        'https://localhost:3000/views/orgLabel/projectLabel/graph/sparql',
        (req, res, ctx) => {
          const mockResponse = {
            head: {
              vars: [
                'analysis_report_id',
                'analysis_report_name',
                'analysis_report_description',
                'created_by',
                'created_at',
                'asset_content_url',
                'asset_encoding_format',
                'asset_name',
                'self',
              ],
            },
            results: { bindings: [] },
          };

          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponse)
          );
        }
      )
    );
    const store = mockStore(mockState);
    await act(async () => {
      const { container } = await render(
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
      );
      expect(container).toMatchSnapshot();
    });
  });

  it('add new Analysis Report button is present', async () => {
    server.use(
      rest.post(
        'https://localhost:3000/views/orgLabel/projectLabel/graph/sparql',
        (req, res, ctx) => {
          const mockResponse = {
            head: {
              vars: [
                'analysis_report_id',
                'analysis_report_name',
                'analysis_report_description',
                'created_by',
                'created_at',
                'asset_content_url',
                'asset_encoding_format',
                'asset_name',
                'self',
              ],
            },
            results: { bindings: [] },
          };

          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponse)
          );
        }
      )
    );

    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    server.use(
      rest.post(
        'https://localhost:3000/views/orgLabel/projectLabel/graph/sparql',
        (req, res, ctx) => {
          const mockResponse = {
            head: {
              vars: [
                'analysis_report_id',
                'analysis_report_name',
                'analysis_report_description',
                'created_by',
                'created_at',
                'asset_content_url',
                'asset_encoding_format',
                'asset_name',
                'self',
              ],
            },
            results: { bindings: [] },
          };

          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponse)
          );
        }
      )
    );

    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
    server.use(
      rest.post(
        'https://localhost:3000/views/orgLabel/projectLabel/graph/sparql',
        (req, res, ctx) => {
          const mockResponse = {
            head: {
              vars: [
                'analysis_report_id',
                'analysis_report_name',
                'analysis_report_description',
                'created_by',
                'created_at',
                'asset_content_url',
                'asset_encoding_format',
                'asset_name',
                'self',
              ],
            },
            results: { bindings: [] },
          };

          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponse)
          );
        }
      )
    );

    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
      rest.post(
        'https://localhost:3000/views/orgLabel/projectLabel/graph/sparql',
        (req, res, ctx) => {
          const mockResponse = {
            head: {
              vars: [
                'analysis_report_id',
                'analysis_report_name',
                'analysis_report_description',
                'created_by',
                'created_at',
                'asset_content_url',
                'asset_encoding_format',
                'asset_name',
                'self',
              ],
            },
            results: { bindings: [] },
          };

          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponse)
          );
        }
      ),
      rest.post(
        'https://localhost:3000/resources/orgLabel/projectLabel',
        (req, res, ctx) => {
          const mockResponse = {
            '@context':
              'https://bluebrain.github.io/nexus/contexts/metadata.json',
            '@id':
              'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/2098607b-30ae-493f-9e07-38f4822a0787',
            '@type': 'https://neuroshapes.org/AnalysisReport',
            _constrainedBy:
              'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
            _createdAt: '2022-06-29T12:34:49.183Z',
            _createdBy:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
            _deprecated: false,
            _incoming:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/2098607b-30ae-493f-9e07-38f4822a0787/incoming',
            _outgoing:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/2098607b-30ae-493f-9e07-38f4822a0787/outgoing',
            _project:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/bbp-users/nicholas',
            _rev: 1,
            _schemaProject:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/bbp-users/nicholas',
            _self:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/2098607b-30ae-493f-9e07-38f4822a0787',
            _updatedAt: '2022-06-29T12:34:49.183Z',
            _updatedBy:
              'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
          };

          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponse)
          );
        }
      )
    );

    const store = mockStore(mockState);
    await act(async () => {
      await render(
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
});
