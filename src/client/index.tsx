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
import getUserManager from './userManager';
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
});
Nexus.setEnvironment(preloadedState.config.apiEndpoint);
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
  // Raised when a user session has been established (or re-established).
  userManager.events.addUserLoaded(user => {
    loadUser(store, userManager);
    Nexus.setToken(user.access_token);
  });

  // Raised prior to the access token expiring.
  userManager.events.addAccessTokenExpiring(() => {
    store.dispatch(userExpiring());
    userManager
      .signinSilent()
      .then(user => {
        loadUser(store, userManager);
        Nexus.setToken(user.access_token);
      })
      .catch(err => {
        // TODO: sentry that stuff
      });
  });

  // Raised after the access token has expired.
  userManager.events.addAccessTokenExpired(() => {
    store.dispatch(userExpired());
    userManager
      .signinSilent()
      .then(user => {
        loadUser(store, userManager);
        Nexus.setToken(user.access_token);
      })
      .catch(err => {
        // TODO: sentry that stuff
      });
  });

  // Raised when the automatic silent renew has failed.
  userManager.events.addSilentRenewError(() => {
    store.dispatch(silentRenewError());
    Nexus.removeToken();
  });

  //  Raised when the user's sign-in status at the OP has changed.
  userManager.events.addUserSignedOut(() => {
    store.dispatch(userSignedOut());
    Nexus.removeToken();
  });

  // Raised when a user session has been terminated.
  userManager.events.addUserUnloaded(() => {
    store.dispatch(sessionTerminated());
    Nexus.removeToken();
  });

  try {
    let user;
    // do we already have a user?
    user = await userManager.getUser();
    if (user) {
      // we've loaded a user, refresh it
      user = await userManager.signinSilent();
    }
    // nope, are we receiving a new token?
    else {
      user = await userManager.signinRedirectCallback();
    }
  } catch (e) {
    // nothing to do, we are just not logged in
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
  // configure user manager
  const userManager = getUserManager(store.getState());
  // if userManger isn't undefined, setupSession
  // it could be undefined if there are no realms
  // to login with for example, or the realm we
  // logged in with isn't available any more
  if (userManager) {
    await setupUserSession(userManager, store);
  }
  renderApp();
}
main();
