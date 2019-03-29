import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import {
  loadUser,
  userExpired,
  silentRenewError,
  sessionTerminated,
  userExpiring,
  userSignedOut,
} from 'redux-oidc';
import Nexus from '@bbp/nexus-sdk';
import userManager, { getUserManager } from './userManager';
import App from '../shared/App';
import configureStore from '../shared/store';
import { RootState } from '../shared/store/reducers';
import { UserManager } from 'oidc-client';
import { Store } from 'redux';

// The app base URL
const rawBase: string = (window as any)['__BASE__'] || '/';
// remove trailing slash
const base: string = rawBase.replace(/\/$/, '');
// setup browser history
const history = createBrowserHistory({ basename: base });
// Grab preloaded state
const preloadedState: RootState = (window as any).__PRELOADED_STATE__;

// create Nexus instance
const nexus = new Nexus({
  environment: preloadedState.config.apiEndpoint,
  token: preloadedState.oidc.user && preloadedState.oidc.user.access_token,
});
// create redux store
const store = configureStore(history, nexus, preloadedState);

/**
 * Sets up user token management events and
 * checks if we have a valid user token or not
 * If we do I have, the token can be valid, or invalid.
 * if invalid, we can try to do a silent refresh
 *
 * Outcome in all cases is, we have an authenticated user or we don't
 */
const setupUserSession = async (userManager: UserManager, store: Store) => {
  userManager.events.addAccessTokenExpiring(() => {
    store.dispatch(userExpiring());
    userManager
      .signinSilent()
      .then(user => {
        loadUser(store, userManager);
        Nexus.setToken(user.access_token);
      })
      .catch(err => {
        // console.error('No silent renew possible', err)
      });
  });
  userManager.events.addAccessTokenExpired(() => {
    store.dispatch(userExpired());
    userManager
      .signinSilent()
      .then(user => {
        loadUser(store, userManager);
        Nexus.setToken(user.access_token);
      })
      .catch(err => {
        // console.error('No silent renew possible', err);
      });
  });
  userManager.events.addSilentRenewError(() => {
    store.dispatch(silentRenewError());
    Nexus.removeToken();
  });
  userManager.events.addUserSignedOut(() => {
    store.dispatch(userSignedOut());
    Nexus.removeToken();
  });
  userManager.events.addUserUnloaded(() => {
    store.dispatch(sessionTerminated());
    Nexus.removeToken();
  });

  let user;
  try {
    // do we already have a user?
    user = await userManager.getUser();
    // nope, are we receiving a new token?
    if (!user) user = await userManager.signinRedirectCallback();
    // if we're here, we now have a user, load it in state
    loadUser(store, userManager);
  } catch (e) {
    // console.error(e);
  }
};

const renderApp = () => {
  return ReactDOM.hydrate(
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </Provider>,
    document.getElementById('app')
  );
};

// DEVELOPMENT ONLY
// if Hot module Replacement is enables
// render app with new bundle.
if (module.hot) {
  // tslint:disable-next-line:no-console
  console.log("🔥It's hot!🔥");
  module.hot.accept('../shared/App', () => {
    const NextApp: React.StatelessComponent<{}> = require('../shared/App')
      .default;
    ReactDOM.hydrate(
      <Provider store={store}>
        <BrowserRouter basename={base}>
          <NextApp />
        </BrowserRouter>
      </Provider>,
      document.getElementById('app')
    );
  });
}

async function main() {
  const userManager = getUserManager(store);
  if (userManager) {
    await setupUserSession(userManager, store);
  }
  renderApp();
}
main();
