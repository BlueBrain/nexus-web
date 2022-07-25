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
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

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

  it('On an individual analysis report, the option to go to navigate to the parent container resource is presented', async () => {
    server.use(
      rest.post(
        'https://localhost:3000/views/orgLabel/projectLabel/graph/sparql',
        (req, res, ctx) => {
          const mockResponse = {
            head: {
              vars: [
                'container_resource_id',
                'container_resource_name',
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
            results: {
              bindings: [
                {
                  analysis_report_description: {
                    type: 'literal',
                    value:
                      "This is our analysis report. Isn't it great! Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. 555",
                  },
                  analysis_report_id: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1',
                  },
                  analysis_report_name: {
                    type: 'literal',
                    value: 'Our Very First Analysis Report!',
                  },
                  asset_content_url: {
                    type: 'literal',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/d3d1cc48-9547-4c9c-a08f-f281ffb458cc',
                  },
                  asset_encoding_format: {
                    type: 'literal',
                    value: 'image/png',
                  },
                  asset_name: {
                    type: 'literal',
                    value: 'insta_logo_large.png',
                  },
                  container_resource_id: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysis1',
                  },
                  container_resource_name: {
                    type: 'literal',
                    value: 'Analysis container',
                  },
                  created_at: {
                    datatype: 'http://www.w3.org/2001/XMLSchema#dateTime',
                    type: 'literal',
                    value: '2022-06-17T04:14:06.357Z',
                  },
                  created_by: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
                  },
                  self: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1',
                  },
                },
              ],
            },
          };

          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponse)
          );
        }
      )
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
    server.use(
      rest.post(
        'https://localhost:3000/views/orgLabel/projectLabel/graph/sparql',
        (req, res, ctx) => {
          const mockResponse = {
            head: {
              vars: [
                'container_resource_id',
                'container_resource_name',
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
            results: {
              bindings: [
                {
                  analysis_report_description: {
                    type: 'literal',
                    value:
                      "This is our analysis report. Isn't it great! Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. 555",
                  },
                  analysis_report_id: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1',
                  },
                  analysis_report_name: {
                    type: 'literal',
                    value: 'Our Very First Analysis Report!',
                  },
                  asset_content_url: {
                    type: 'literal',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/d3d1cc48-9547-4c9c-a08f-f281ffb458cc',
                  },
                  asset_encoding_format: {
                    type: 'literal',
                    value: 'image/png',
                  },
                  asset_name: {
                    type: 'literal',
                    value: 'insta_logo_large.png',
                  },
                  container_resource_id: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysis1',
                  },
                  container_resource_name: {
                    type: 'literal',
                    value: 'Analysis container',
                  },
                  created_at: {
                    datatype: 'http://www.w3.org/2001/XMLSchema#dateTime',
                    type: 'literal',
                    value: '2022-06-17T04:14:06.357Z',
                  },
                  created_by: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
                  },
                  self: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1',
                  },
                },
              ],
            },
          };

          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponse)
          );
        }
      )
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
            results: {
              bindings: [
                {
                  analysis_report_description: {
                    type: 'literal',
                    value:
                      "This is our analysis report. Isn't it great! Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. 555",
                  },
                  analysis_report_id: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1',
                  },
                  analysis_report_name: {
                    type: 'literal',
                    value: 'Our Very First Analysis Report!',
                  },
                  asset_content_url: {
                    type: 'literal',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/d3d1cc48-9547-4c9c-a08f-f281ffb458cc',
                  },
                  asset_encoding_format: {
                    type: 'literal',
                    value: 'image/png',
                  },
                  asset_name: {
                    type: 'literal',
                    value: 'insta_logo_large.png',
                  },
                  container_resource_id: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysis1',
                  },
                  container_resource_name: {
                    type: 'literal',
                    value: 'Analysis container',
                  },
                  created_at: {
                    datatype: 'http://www.w3.org/2001/XMLSchema#dateTime',
                    type: 'literal',
                    value: '2022-06-17T04:14:06.357Z',
                  },
                  created_by: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
                  },
                  self: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1',
                  },
                },
              ],
            },
          };

          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponse)
          );
        }
      )
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

    expect(
      await waitFor(
        () => screen.getByRole('heading', { name: 'Analysis Name' }).textContent
      )
    ).toBe('Our Very First Analysis Report!');
  });

  it('On edit mode image delete button is visible', async () => {
    server.use(
      rest.post(
        'https://localhost:3000/views/orgLabel/projectLabel/graph/sparql',
        (req, res, ctx) => {
          const mockResponse = {
            head: {
              vars: [
                'container_resource_id',
                'container_resource_name',
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
            results: {
              bindings: [
                {
                  analysis_report_description: {
                    type: 'literal',
                    value:
                      "This is our analysis report. Isn't it great! Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. 555",
                  },
                  analysis_report_id: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1',
                  },
                  analysis_report_name: {
                    type: 'literal',
                    value: 'Our Very First Analysis Report!',
                  },
                  asset_content_url: {
                    type: 'literal',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/d3d1cc48-9547-4c9c-a08f-f281ffb458cc',
                  },
                  asset_encoding_format: {
                    type: 'literal',
                    value: 'image/png',
                  },
                  asset_name: {
                    type: 'literal',
                    value: 'insta_logo_large.png',
                  },
                  container_resource_id: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysis1',
                  },
                  container_resource_name: {
                    type: 'literal',
                    value: 'Analysis container',
                  },
                  created_at: {
                    datatype: 'http://www.w3.org/2001/XMLSchema#dateTime',
                    type: 'literal',
                    value: '2022-06-17T04:14:06.357Z',
                  },
                  created_by: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
                  },
                  self: {
                    type: 'uri',
                    value:
                      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/bbp-users/nicholas/_/MyTestAnalysisReport1',
                  },
                },
              ],
            },
          };

          return res(
            // Respond with a 200 status code
            ctx.status(200),
            ctx.json(mockResponse)
          );
        }
      )
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
      await waitFor(() => screen.getByRole('button', { name: 'Delete' }))
    ).toBeInTheDocument();
  });
});
