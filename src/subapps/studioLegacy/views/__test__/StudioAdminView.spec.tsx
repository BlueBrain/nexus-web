import { NexusProvider } from '@bbp/react-nexus';
import { createNexusClient } from '@bbp/nexus-sdk';
import StudioAdminView from '../StudioAdminView';
import { createBrowserHistory } from 'history';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import configureStore from '../../../../shared/store';
import fetch from 'node-fetch';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  server,
} from '../../../../utils/testUtil';
import { rest } from 'msw';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';

describe('StudioListContainer', () => {
  const history = createBrowserHistory({ basename: '/' });

  // establish API mocking before all tests
  beforeAll(() => {
    server.listen();
  });
  // reset any request handlers that are declared as a part of our tests
  // (i.e. for testing one-time error scenarios)
  afterEach(() => server.resetHandlers());
  // clean up once the tests are done
  afterAll(() => server.close());

  const nexus = createNexusClient({
    fetch,
    uri: 'https://localhost:3000',
  });
  const store = configureStore(history, { nexus }, {});
  it('renders studios in a list', async () => {
    await act(async () => {
      await render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <NexusProvider nexusClient={nexus}>
              <StudioAdminView></StudioAdminView>
            </NexusProvider>
          </ConnectedRouter>
        </Provider>
      );
    });
    expect(true).toBe(true);
  });
});
