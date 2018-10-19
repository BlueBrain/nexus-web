import React = require('react');
import ReactDOM = require('react-dom');
import App from './App';

ReactDOM.hydrate(
  <App />,
  document.getElementById('app'),
);

if (module.hot) {
  console.log('Its hot');
  module.hot.accept('./App', () => {
    /* tslint:disable-next-line */
    const NextApp: React.StatelessComponent<{}> = require('./App').default;
    ReactDOM.hydrate(
      <NextApp />,
      document.getElementById('app'),
    );
  });
}
