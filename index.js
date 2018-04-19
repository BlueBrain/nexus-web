import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './src/components/App';
import store from './src/store';
import { Route } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';
import history from './src/libs/history'

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history} >
      <Route path="/*" component={App}>
      </Route>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('explorer-app')
);
