import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { NexusProvider } from '@bbp/react-nexus';
import { createMemoryHistory } from 'history';
import { createNexusClient } from '@bbp/nexus-sdk';
import { Provider } from 'react-redux';
import fetch from 'node-fetch';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ConnectedRouter } from 'connected-react-router';
import WorkSpaceMenu, { StudioResource } from '../WorkspaceMenuContainer';
import { configureStore } from '../../../../store';
import { render, fireEvent, screen } from '../../../../utils/testUtil';
import StudioReactContext, {
  StudioContextType,
} from '../../contexts/StudioContext';
import { deltaPath, handlers } from '__mocks__/handlers/handlers';
import {
  aclHandler,
  dashboardHandler,
  tableHandler,
  workspaceHandler,
} from './WorkSpaceMenuContainerHandlers';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { RenderResult, act } from '@testing-library/react';
import { setupServer } from 'msw/node';

describe('workSpaceMenu', () => {
  const history = createMemoryHistory({});
  const contextValue: StudioContextType = {
    orgLabel: 'org',
    projectLabel: 'project',
    studioId: 'studio1',
    isWritable: true,
  };
  const nexus = createNexusClient({
    fetch,
    uri: deltaPath(),
  });
  const store = configureStore(history, { nexus }, {});
  const resource = ({
    '@context': [
      'https://bluebrain.github.io/nexus/contexts/metadata.json',
      'https://bluebrainnexus.io/studio/context',
    ],
    '@id': 'studio1',
    '@type': 'Studio',
    description: '',
    label: 'SSCx portal data',
    plugins: [
      {
        customise: true,
        plugins: [
          { expanded: false, key: 'video' },
          { expanded: false, key: 'preview' },
          { expanded: false, key: 'admin' },
          { expanded: false, key: 'circuit' },
          { expanded: false, key: 'image-collection-viewer' },
          { expanded: false, key: 'jira' },
          { expanded: false, key: 'markdown' },
        ],
      },
    ],
    workspaces: ['w1'],
    _project: 'org/project',
    _constrainedBy:
      'https://bluebrain.github.io/nexus/schemas/unconstrained.json',
    _createdAt: '2022-03-31T17:08:53.747Z',
    _createdBy:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/serviceaccounts/users/service-account-nexus-sa',
    _deprecated: false,
    _incoming:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F98b08a64-f116-46cd-8568-be2aa2849cc4/incoming',
    _outgoing:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F98b08a64-f116-46cd-8568-be2aa2849cc4/outgoing',
    _rev: 149,
    _schemaProject:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/projects/copies/sscx',
    _self:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/resources/copies/sscx/_/https:%2F%2Fbbp.epfl.ch%2Fneurosciencegraph%2Fdata%2F98b08a64-f116-46cd-8568-be2aa2849cc4',
    _updatedAt: '2022-05-25T07:58:25.751Z',
    _updatedBy:
      'https://dev.nise.bbp.epfl.ch/nexus/v1/realms/local/users/localuser',
  } as unknown) as StudioResource;

  const queryClient = new QueryClient();

  let container: HTMLElement;
  let user: UserEvent;
  let component: RenderResult;
  const server = setupServer(...handlers);

  // establish API mocking before all tests
  beforeAll(() => {
    server.listen();
  });

  beforeEach(async () => {
    server.use(workspaceHandler);
    server.use(dashboardHandler);
    server.use(tableHandler);

    if (component) {
      component.unmount();
    }

    component = await render(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <NexusProvider nexusClient={nexus}>
            <QueryClientProvider client={queryClient}>
              <StudioReactContext.Provider value={contextValue}>
                <WorkSpaceMenu
                  workspaceIds={['w1']}
                  studioResource={resource}
                  onListUpdate={vi.fn}
                ></WorkSpaceMenu>
              </StudioReactContext.Provider>
            </QueryClientProvider>
          </NexusProvider>
        </ConnectedRouter>
      </Provider>
    );

    container = component.container;

    user = userEvent.setup();
  });

  // reset any request handlers that are declared as a part of our tests
  // (i.e. for testing one-time error scenarios)
  afterEach(() => {
    server.resetHandlers();
    queryClient.clear();
  });

  // clean up once the tests are done
  afterAll(() => {
    server.close();
  });

  it('renders with a single workspace and dashboard ', async () => {
    const dashboardText = await screen.findByText(/Example/);
    expect(dashboardText).toBeVisible();
    const text = await screen.findAllByText(
      'https://bluebrain.github.io/nexus/vocabulary/apiMappings'
    );
    expect(text.length).toBe(9);
  });

  it('shows edit buttons for a user with  edit access', async () => {
    const workspaceButton = await screen.findByText('Workspace');
    expect(workspaceButton).toBeVisible();
    const dashboardButton = await screen.findByText('Dashboard');
    expect(dashboardButton).toBeVisible();
  });

  it('hides edit buttons for a user with out edit access', async () => {
    server.use(aclHandler);

    await render(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <NexusProvider nexusClient={nexus}>
            <QueryClientProvider client={queryClient}>
              <StudioReactContext.Provider value={contextValue}>
                <WorkSpaceMenu
                  workspaceIds={['w1']}
                  studioResource={resource}
                  onListUpdate={vi.fn}
                ></WorkSpaceMenu>
              </StudioReactContext.Provider>
            </QueryClientProvider>
          </NexusProvider>
        </ConnectedRouter>
      </Provider>
    );

    await screen.findAllByText('No dashboards available');
    const buttons = await screen.findAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('it displays workspace action on clicking  workspace action button', async () => {
    const button1 = await screen.findByText('Workspace');
    expect(button1).toBeVisible();
    const button2 = await screen.findByText('Dashboard');
    expect(button2).toBeVisible();
    await user.click(button1);

    expect(await screen.findByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('it displays workspace add form on clicking add workspace button', async () => {
    await screen.findAllByText('Workspace');
    const workSpaceAction = (await screen.getAllByText(
      'Workspace'
    )[0]) as HTMLButtonElement;

    fireEvent.click(workSpaceAction);

    await screen.findByText('Add');

    const editButton = await screen.findByText('Add');
    await fireEvent.click(editButton);

    const editForm = await screen.findAllByText('Create a new Workspace');
    expect(editForm).toHaveLength(1);
  });

  it('it displays workspace remove confirmation  on clicking remove workspace button', async () => {
    const workSpaceAction = (
      await screen.findAllByText('Workspace')
    )[0] as HTMLButtonElement;
    fireEvent.click(workSpaceAction);
    const editButton = await screen.findByText('Remove');
    expect(editButton).toBeInTheDocument();
    await fireEvent.click(editButton);
    const editForm = await screen.findAllByText('Delete Workspace');
    expect(editForm).toHaveLength(1);
  });

  it('it displays workspace edit form on clicking edit workspace button', async () => {
    const workSpaceAction = (
      await screen.findAllByText('Workspace')
    )[0] as HTMLButtonElement;
    act(() => {
      fireEvent.click(workSpaceAction);
    });
    const editButton = await screen.findByText('Edit');
    expect(editButton).toBeInTheDocument();
    await act(async () => {
      await user.click(editButton);
    });
    const editForm = screen.getByTestId('editWorkspace');
    expect(editForm).toBeInTheDocument();
  });

  it('it displays dashboard edit/add/remove options on clicking dahsboard edit action', async () => {
    const dashboardAction = await screen.findByText('Dashboard');
    await fireEvent.click(dashboardAction);
    const addButton = await screen.findByText('Add');
    expect(addButton).toBeInTheDocument();
  });

  it('it displays dashboard add form when clicked on add button', async () => {
    const dashboardAction = await screen.findByText('Dashboard');
    await fireEvent.click(dashboardAction);

    const addButton = await screen.findByText('Add');
    expect(addButton).toBeInTheDocument();
    await fireEvent.click(addButton);

    const dbForm = await screen.findByText('Create Dashboard');
    expect(dbForm).toBeInTheDocument();
  });
});
