import '@testing-library/jest-dom'
import { Provider } from 'react-redux';
import { act } from 'react-dom/test-utils';
import { Router, } from 'react-router-dom';
import { Store } from 'redux';

import { createBrowserHistory, History } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import { createNexusClient } from '@bbp/nexus-sdk';
import AdvancedModeToggle from './AdvancedMode';
import configureStore from '../../store';
import {
  render,
  fireEvent,
  waitFor,
  screen,
} from '../../../utils/testUtil';

describe('AdvancedModeToggle', () => {
  let history: History<unknown>;
  let store: Store;
  let nexus;

  beforeEach(() => {
    history = createBrowserHistory({ basename: '/' });
    nexus = createNexusClient({
      fetch,
      uri: 'https://localhost:3000',
    });
    store = configureStore(history, { nexus }, {});
  })
  it('should toggle advanced mode be in the', async () => {
    await act(async () => {
      await render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <AdvancedModeToggle />
          </ConnectedRouter>
        </Provider>
      );
    });
    await waitFor(async () => {
      const toggleSwitch = await screen.getByTestId('advanced-mode-toggle');
      expect(toggleSwitch).toBeInTheDocument();
    });

  });
  it('should the history be in /data-explorer', async () => {
    await act(async () => {
      await render(
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <AdvancedModeToggle />
          </ConnectedRouter>
        </Provider>
      );
    });
    await waitFor(async () => {
      const toggleSwitch = await screen.getByTestId('advanced-mode-toggle');
      fireEvent.click(toggleSwitch);
    });
    const state = store.getState();
    const currentPath = history.location.pathname;
    expect(state.uiSettings.isAdvancedModeEnabled).toBeTruthy();
    expect(currentPath).toBe('/data-explorer');
  })
  it('should not render the toggle on blacklisted pages', () => {
    history.push('/studios');
    render(
      <Provider store={store}>
        <Router history={history}>
          <AdvancedModeToggle />
        </Router>
      </Provider>
    );

    const toggleSwitch = screen.queryByTestId('advanced-mode-toggle');
    expect(toggleSwitch).toBeNull();
  });
});
