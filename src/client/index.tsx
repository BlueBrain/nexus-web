import React = require('react');
import ReactDOM = require('react-dom');
import { BrowserRouter } from 'react-router-dom';
import App from '../shared/App';

ReactDOM.hydrate(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('app'),
);

if (module.hot) {
  console.log('Its hot');
  module.hot.accept('../shared/App', () => {
    const NextApp: React.StatelessComponent<{}> = require('../shared/App').default;
    ReactDOM.hydrate(
      <NextApp />,
      document.getElementById('app'),
    );
  });
}
