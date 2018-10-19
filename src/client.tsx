import React = require('react');
import ReactDOM = require('react-dom');
import App from './shared/App';

ReactDOM.hydrate(
  <App />,
  document.getElementById('app'),
);

if (module.hot) {
  console.log('Its hot');
  module.hot.accept('./shared/App', () => {
    /* tslint:disable-next-line */
    const NextApp: React.StatelessComponent<{}> = require('./shared/App').default;
    ReactDOM.hydrate(
      <NextApp />,
      document.getElementById('app'),
    );
  });
}
