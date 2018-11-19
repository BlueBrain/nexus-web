import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import App from '../shared/App';
import configureStore from '../shared/store';
import AuthContext, { AuthContextState } from '../shared/context/AuthContext';

const rawBase: string = (window as any)['__BASE__'] || '/';
// remove trailing slash
const base: string = rawBase.replace(/\/$/, '');
// Are we running with SSL
const isSecure = location.protocol === 'https:';
const cookieName = isSecure ? '__Host-nexusAuth' : '_Host-nexusAuth';
// Grab preloaded state
const preloadedState: object = (window as any).__PRELOADED_STATE__;
// setup browser history
const history = createBrowserHistory({ basename: base });
// create redux store
const store = configureStore(history, preloadedState);

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
