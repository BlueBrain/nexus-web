import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from '../shared/App';
import createStore from '../shared/store';
import AuthContext, { AuthContextState } from '../shared/context/AuthContext';

const rawBase: string = (window as any)['__BASE__'] || '/';
// remove trailing slash
const base: string = rawBase.replace(/\/$/, '');
// Are we running with SSL
const isSecure = location.protocol === 'https:';
const cookieName = isSecure ? '__Host-nexusAuth' : '_Host-nexusAuth';
// Grab preloaded state
const preloadedState: object = (window as any).__PRELOADED_STATE__;
const store = createStore(preloadedState);

// get auth data from cookies
// TODO: this is a POC, this code needs to be improved and tested
function getAuthData(): AuthContextState {
  const all: string[] = decodeURIComponent(document.cookie).split('; ');
  const rawAuthCookie: string = all.filter(cookie =>
    cookie.includes(`${cookieName}=`)
  )[0];
  if (!rawAuthCookie) {
    return {
      authenticated: false,
    };
  }
  let authCookie: {
    accessToken: string;
    authorizationEndpoint: string;
    endSessionEndpoint: string;
    redirectHostName: string;
  };
  try {
    authCookie = JSON.parse(rawAuthCookie.replace(`${cookieName}=`, ''));
  } catch (e) {
    return {
      authenticated: false,
    };
  }
  return {
    authenticated: true,
    ...authCookie,
  };
}

const renderApp = () => {
  return ReactDOM.hydrate(
    <Provider store={store}>
      <AuthContext.Provider value={getAuthData()}>
        <BrowserRouter basename={base}>
          <App />
        </BrowserRouter>
      </AuthContext.Provider>
    </Provider>,
    document.getElementById('app')
  );
};

// DEVELOPMENT ONLY
// if Hot module Replacement is enables
// render app with new bundle.
if (module.hot) {
  console.log("It's hot!");
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

renderApp();
