import React = require('react');
import ReactDOM = require('react-dom');
import { BrowserRouter } from 'react-router-dom';
import App from '../shared/App';
import AuthContext, { AuthContextState } from '../shared/context/AuthContext';

const rawBase: string = (window as any)['__BASE__'] || '/';
// remove trailing slash
const base: string = rawBase.replace(/\/$/, '');
// Are we running with SSL
const isSecure = location.protocol === 'https:';
const cookieName = isSecure ? '__Host-nexusAuth' : '_Host-nexusAuth';

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
  let authCookie: { accessToken: string };
  try {
    authCookie = JSON.parse(rawAuthCookie.replace(`${cookieName}=`, ''));
  } catch (e) {
    return {
      authenticated: false,
    };
  }
  return {
    authenticated: true,
    accessToken: authCookie.accessToken,
  };
}

const renderApp = () =>
  ReactDOM.hydrate(
    <AuthContext.Provider value={getAuthData()}>
      <BrowserRouter basename={base}>
        <App />
      </BrowserRouter>
    </AuthContext.Provider>,
    document.getElementById('app')
  );

// DEVELOPMENT ONLY
// if Hot module Replacement is enables
// render app with new bundle.
if (module.hot) {
  console.log("It's hot!");
  module.hot.accept('../shared/App', () => {
    const NextApp: React.StatelessComponent<{}> = require('../shared/App')
      .default;
    ReactDOM.hydrate(
      <BrowserRouter basename={base}>
        <NextApp />
      </BrowserRouter>,
      document.getElementById('app')
    );
  });
}

renderApp();
